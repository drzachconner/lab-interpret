// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function (Deno)
// Endpoint: POST /fullscript-webhook
//
// Env vars to set in Supabase:
// - OPENAI_API_KEY
// - RESEND_API_KEY                         // for notifications
// - FULLSCRIPT_WEBHOOK_SECRET              // if Fullscript signs webhooks
// - SUPABASE_SERVICE_ROLE_KEY             // for service client (bypass RLS)
// - SUPABASE_URL

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type FSWebhook = {
  type: "order.created" | "order.updated" | "order.paid" | "order.shipped" | "order.completed" | "order.cancelled" | "result.ready";
  data: any; // Fullscript payload; shape differs by event
  // optionally: signature headers for verification
};

type RawLabResult = {
  sex?: 'Male' | 'Female' | 'Other' | 'Unknown';
  age?: number;
  labs: Array<{
    test: string;
    value: number;
    unit?: string;
    ref?: string;
  }>;
};

type DeidentifiedPayload = {
  patient_id: string;
  age_bucket: string;
  sex: 'Male' | 'Female' | 'Other' | 'Unknown';
  labs: Array<{
    test: string;
    value: number;
    unit?: string;
    ref?: string;
  }>;
  context?: Record<string, string | number | boolean>;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supa = createClient(supabaseUrl, serviceKey);

// ---- CORS Headers ----
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---- Optional: simple HMAC signature check (adjust to Fullscript spec) ----
function verifySignature(req: Request): boolean {
  const secret = Deno.env.get("FULLSCRIPT_WEBHOOK_SECRET");
  if (!secret) return true; // allow if not configured yet (dev)
  // Example (pseudo): const sig = req.headers.get('x-fullscript-signature');
  // const body = await req.clone().text(); const valid = hmac(body, secret) === sig
  // return !!valid;
  return true;
}

// ---- Age Bucketing ----
function bucketAge(age?: number): string {
  if (age == null || Number.isNaN(age)) return "Unknown";
  if (age >= 90) return "90+";
  const buckets = [[0,1],[2,5],[6,12],[13,17],[18,24],[25,34],[35,44],[45,54],[55,64],[65,74],[75,89]];
  for (const [lo, hi] of buckets) if (age >= lo && age <= hi) return `${lo}-${hi}`;
  return "Unknown";
}

// ---- Deidentification ----
function deidentifyLabPayload(input: RawLabResult, opts?: {
  pseudoId?: string;
  context?: Record<string, string | number | boolean>;
}): { safe: DeidentifiedPayload; blocked?: { reason: string; details?: any } } {
  // Block if analytes are missing or non-numeric
  if (!input?.labs || !Array.isArray(input.labs) || input.labs.length === 0) {
    return { safe: {} as any, blocked: { reason: 'No labs' } };
  }

  // Compute age bucket
  const ageBucket = bucketAge(input.age);

  // Build safe labs (ignore any weird fields or non-numeric values)
  const labs = input.labs
    .filter(l => typeof l.value === "number" && Number.isFinite(l.value))
    .map(l => ({
      test: String(l.test || "").slice(0, 120),
      value: Number(l.value),
      unit: l.unit ? String(l.unit).slice(0, 32) : undefined,
      ref: l.ref ? String(l.ref).slice(0, 64) : undefined,
    }));

  // Generate a stable pseudonymous id (do NOT reuse auth_id directly)
  const patient_id = opts?.pseudoId ?? `pt_${Math.random().toString(36).slice(2, 8)}`;

  const safe: DeidentifiedPayload = {
    patient_id,
    age_bucket: ageBucket,
    sex: input.sex ?? "Unknown",
    labs,
    context: opts?.context,
  };

  return { safe };
}

// ---- OpenAI (no PHI) ----
async function analyzeWithOpenAI(safePayload: any) {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const system = `
You are a functional medicine analyst. Use functional ranges and evidence-informed biohacking best practices.
Return a JSON object with keys: "flags", "insights", "supplements", "lifestyle", "follow_up_labs".
Do not include any personally identifying information.
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(safePayload) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "{}";
  return JSON.parse(content);
}

// ---- Notification (no PHI in email) ----
async function sendEmail(to: string, subject: string, text: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return; // silently skip in dev

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "BiohackLabs.ai <onboarding@resend.dev>",
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    console.error("Failed to send email:", await response.text());
  }
}

// ---- Webhook Event Handlers ----
async function handleOrderCreated(fs: any, profileId: string, supabase: any) {
  console.log("Order created:", fs.order_id);
  // Order creation is handled in the main flow
}

async function handleOrderPaid(fs: any, profileId: string, supabase: any) {
  const { order_id, payment_amount, payment_date } = fs;
  
  await supabase
    .from('orders')
    .update({ 
      status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('fullscript_order_id', order_id);
    
  // Send payment confirmation email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', profileId)
    .single();
    
  if (profile?.email) {
    await sendEmail(
      profile.email,
      "Payment Confirmed - Lab Order Processing",
      "Your payment has been confirmed and your lab order is being processed. You'll receive updates as your order progresses."
    );
  }
  
  console.log("Order paid:", order_id);
}

async function handleOrderShipped(fs: any, profileId: string, supabase: any) {
  const { order_id, tracking_number, shipping_date } = fs;
  
  await supabase
    .from('orders')
    .update({ 
      status: 'shipped',
      updated_at: new Date().toISOString()
    })
    .eq('fullscript_order_id', order_id);
    
  // Send shipping notification
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', profileId)
    .single();
    
  if (profile?.email) {
    await sendEmail(
      profile.email,
      "Lab Kit Shipped - Tracking Information",
      `Your lab kit has been shipped! ${tracking_number ? `Tracking number: ${tracking_number}` : 'You\'ll receive tracking information soon.'}`
    );
  }
  
  console.log("Order shipped:", order_id);
}

async function handleOrderCompleted(fs: any, profileId: string, supabase: any) {
  const { order_id, completion_date } = fs;
  
  await supabase
    .from('orders')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('fullscript_order_id', order_id);
    
  console.log("Order completed:", order_id);
}

async function handleOrderCancelled(fs: any, profileId: string, supabase: any) {
  const { order_id, cancellation_reason } = fs;
  
  await supabase
    .from('orders')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('fullscript_order_id', order_id);
    
  // Send cancellation notification
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', profileId)
    .single();
    
  if (profile?.email) {
    await sendEmail(
      profile.email,
      "Lab Order Cancelled",
      `Your lab order has been cancelled. ${cancellation_reason ? `Reason: ${cancellation_reason}` : 'Please contact support if you have questions.'}`
    );
  }
  
  console.log("Order cancelled:", order_id);
}

async function handleResultReady(fs: any, profileId: string, supabase: any) {
  console.log("Results ready for order:", fs.order_id);
  // Result processing is handled in the main flow
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    if (!verifySignature(req)) {
      return new Response("Invalid signature", { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const payload = (await req.json()) as FSWebhook;
    console.log("Received webhook:", payload.type);

    // 1) Identify event
    const eventType = payload?.type ?? "unknown";
    const fs = payload?.data ?? {};

    // 2) Map Fullscript data → our model
    // You will need to adapt field names to the exact Fullscript webhook schema you enable.
    const fsOrderId = String(fs?.order_id ?? fs?.id ?? "");
    const panelName = String(fs?.panel_name ?? fs?.panel ?? fs?.tests?.[0]?.panel ?? "Unknown Panel");
    const authId = fs?.metadata?.auth_id ?? null; // if you attach auth_id/user_id in FS metadata at order time
    const userEmail = fs?.patient?.email ?? null; // for notification (non-PHI enough; avoid names)
    const sex = (fs?.patient?.sex as string) || "Unknown";
    const age = typeof fs?.patient?.age === "number" ? fs.patient.age : undefined;

    // 3) Resolve our user/profile (if you store mapping in FS metadata)
    let profileId: string | null = null;
    if (authId) {
      const { data: prof } = await supa
        .from("profiles")
        .select("id")
        .eq("auth_id", authId)
        .maybeSingle();
      profileId = prof?.id ?? null;
    }

    // If we cannot map to a profile, you can still store the order row without user_id and reconcile later.
    // For simplicity, we'll require it here:
    if (!profileId) {
      console.log("No profile mapping found for authId:", authId);
      return new Response(JSON.stringify({ ok: true, note: "No profile mapping; skipping." }), { 
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 4) Handle different order status updates
    const WEBHOOK_EVENTS = {
      'order.created': handleOrderCreated,
      'order.paid': handleOrderPaid,
      'order.shipped': handleOrderShipped,
      'order.completed': handleOrderCompleted,
      'order.cancelled': handleOrderCancelled,
      'result.ready': handleResultReady
    };

    // Call the appropriate handler
    if (WEBHOOK_EVENTS[eventType as keyof typeof WEBHOOK_EVENTS]) {
      await WEBHOOK_EVENTS[eventType as keyof typeof WEBHOOK_EVENTS](fs, profileId, supa);
    }

    // Status mapping for database updates
    const statusMap: Record<string, string> = {
      "order.created": "created",
      "order.paid": "paid",
      "order.shipped": "shipped",
      "order.completed": "completed",
      "order.cancelled": "cancelled",
      "order.updated": "authorized",
      "result.ready": "resulted",
    };
    const status = (statusMap[eventType] ?? "created") as "created" | "authorized" | "paid" | "shipped" | "completed" | "cancelled" | "collected" | "resulted" | "failed";

    // Optional: parse "raw_result" if present (keep de-identified only, or encrypt column if you implemented that)
    const parsedResult = fs?.results ?? null; // JSON from Fullscript/partner
    const { data: orderRow, error: orderErr } = await supa
      .from("lab_orders")
      .upsert({
        user_id: profileId,
        panel: panelName,
        status,
        fs_order_id: fsOrderId || null,
        raw_result: parsedResult ?? null, // Phase-1: keep this free of identifiers if you can
      }, {
        onConflict: "fs_order_id",
      })
      .select("*")
      .single();

    if (orderErr) {
      console.error("Error upserting lab order:", orderErr);
      throw orderErr;
    }

    console.log("Upserted lab order:", orderRow.id);

    // 5) If results are ready, de-identify & analyze
    if (eventType === "result.ready" && parsedResult) {
      console.log("Processing lab results for order:", orderRow.id);

      // Map Fullscript result JSON to our RawLabResult shape
      const rawLabResult = {
        // DO NOT include identifiers here.
        sex: (sex === "M" ? "Male" : sex === "F" ? "Female" : "Unknown") as "Male"|"Female"|"Other"|"Unknown",
        age,
        labs: Array.isArray(parsedResult?.analytes)
          ? parsedResult.analytes
              .filter((a: any) => typeof a?.value === "number")
              .map((a: any) => ({
                test: String(a.name ?? a.code ?? "Analyte"),
                value: Number(a.value),
                unit: a.unit ? String(a.unit) : undefined,
                ref: a.ref_range ? String(a.ref_range) : undefined,
              }))
          : [],
      };

      // Add a pseudonymous ID
      const pseudoId = `pt_${orderRow.user_id.slice(0, 8)}`;

      const deid = deidentifyLabPayload(rawLabResult, {
        pseudoId,
        context: { panel: panelName },
      });

      if (deid.blocked) {
        console.log("Lab results blocked due to PHI:", deid.blocked.reason);
        // Store a failed/flag note if needed, but do NOT store PHI from deid.blocked.details
        await supa.from("lab_orders").update({ status: "failed" }).eq("id", orderRow.id);
      } else {
        console.log("Analyzing lab results with OpenAI...");
        const analysis = await analyzeWithOpenAI({
          patient_id: deid.safe.patient_id,
          age_bucket: deid.safe.age_bucket ?? bucketAge(age),
          sex: deid.safe.sex,
          labs: deid.safe.labs,
          context: deid.safe.context,
        });

        const { error: interpErr } = await supa.from("interpretations").insert({
          user_id: orderRow.user_id,
          lab_order_id: orderRow.id,
          analysis,
        });

        if (interpErr) {
          console.error("Error creating interpretation:", interpErr);
          throw interpErr;
        }

        console.log("Analysis complete for order:", orderRow.id);
      }

      // 6) Notify user (no PHI)
      if (userEmail) {
        console.log("Sending notification email to:", userEmail);
        await sendEmail(
          userEmail,
          "Your BiohackLabs.ai results are ready",
          "Your lab results have been processed and your personalized analysis is ready. Log in to your BiohackLabs.ai dashboard to view your detailed report and recommendations."
        );
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("fullscript-webhook error:", err);
    return new Response(JSON.stringify({ error: "Server Error" }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
