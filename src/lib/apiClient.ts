// src/lib/apiClient.ts
import { supabase } from "@/integrations/supabase/client";
import {
  ProfileZ, ProfileT,
  CreateProfileInput,
  LabOrderZ, LabOrderT, CreateLabOrderInput,
  InterpretationZ, InterpretationT,
} from "@/types/zod";
import { z } from "zod";

// Use Supabase edge functions URLs
const FUNCTIONS_BASE = "https://zhdjvfylxgtiphldjtqf.supabase.co/functions/v1";

// Generic edge function call with auth + Zod validation
async function callEdgeFunction<T>(
  functionName: string,
  path: string,
  init: RequestInit,
  schema: z.ZodType<T>
): Promise<T> {
  // Attach Supabase JWT
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };

  const url = `${FUNCTIONS_BASE}/${functionName}${path}`;
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();

  // handle non-2xx
  if (!res.ok) {
    let detail: unknown;
    try { detail = JSON.parse(text); } catch { detail = text; }
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(detail)}`);
  }

  // No body
  if (!text) return undefined as unknown as T;

  const json = JSON.parse(text);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error("Validation error for", url, parsed.error.format());
    throw new Error("ValidationError");
  }
  return parsed.data;
}

// --- Schemas to validate lists/basic returns
const ProfilesMaybeZ = z.union([ProfileZ, z.null()]);
const LabOrdersListZ = z.array(LabOrderZ);
const InterpretationsListZ = z.array(InterpretationZ);
const AnalyzeOkZ = z.object({
  interpretation_id: z.string().uuid().optional(),
  status: z.string(),
});

export const api = {
  // Auth & Profiles
  getMyProfile(): Promise<ProfileT | null> {
    return callEdgeFunction("profile-api", "/me/profile", { method: "GET" }, ProfilesMaybeZ);
  },
  createMyProfile(payload: CreateProfileInput): Promise<ProfileT> {
    return callEdgeFunction("profile-api", "/me/profile", { 
      method: "POST", 
      body: JSON.stringify(payload) 
    }, ProfileZ);
  },

  // Lab Orders
  listOrders(): Promise<LabOrderT[]> {
    return callEdgeFunction("orders-api", "/orders", { method: "GET" }, LabOrdersListZ);
  },
  createOrder(payload: CreateLabOrderInput): Promise<LabOrderT> {
    return callEdgeFunction("orders-api", "/orders", { 
      method: "POST", 
      body: JSON.stringify(payload) 
    }, LabOrderZ);
  },
  updateOrderStatus(orderId: string, status: LabOrderT["status"]): Promise<LabOrderT> {
    return callEdgeFunction("orders-api", `/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, LabOrderZ);
  },

  // Interpretations
  listInterpretations(): Promise<InterpretationT[]> {
    return callEdgeFunction("interpretations-api", "/interpretations", { method: "GET" }, InterpretationsListZ);
  },
  getInterpretation(id: string): Promise<InterpretationT> {
    return callEdgeFunction("interpretations-api", `/interpretations/${id}`, { method: "GET" }, InterpretationZ);
  },

  // Ops
  analyzeOrder(lab_order_id: string) {
    return callEdgeFunction("analyze-order", "/analyze", {
      method: "POST",
      body: JSON.stringify({ lab_order_id }),
    }, AnalyzeOkZ);
  },
};