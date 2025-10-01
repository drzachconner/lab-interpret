import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function syncs Fullscript's lab catalog with your database
const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fullscriptApiKey = Deno.env.get('FULLSCRIPT_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting Fullscript lab catalog sync...');

    // Fetch Fullscript lab catalog
    const response = await fetch('https://api.fullscript.com/api/v1/lab_tests', {
      headers: {
        'Authorization': `Bearer ${fullscriptApiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Fullscript API error: ${response.status}`);
    }

    const data = await response.json();
    const fullscriptLabs = data.data || [];

    console.log(`Found ${fullscriptLabs.length} labs in Fullscript catalog`);

    // Update existing lab panels with Fullscript IDs
    let syncedCount = 0;
    let errorCount = 0;

    for (const fsLab of fullscriptLabs) {
      try {
        // Try to match by name or SKU
        const { data: existingPanel } = await supabase
          .from('lab_panels')
          .select('id, name, fullscript_sku')
          .or(`name.ilike.%${fsLab.name}%,fullscript_sku.eq.${fsLab.sku}`)
          .single();

        if (existingPanel) {
          // Update with Fullscript data
          const { error } = await supabase
            .from('lab_panels')
            .update({
              fullscript_id: fsLab.id,
              fullscript_lab_id: fsLab.lab_id,
              fullscript_available: fsLab.available,
              fullscript_last_synced_at: new Date().toISOString(),
              // Update pricing if Fullscript has it
              practitioner_price: fsLab.practitioner_price || existingPanel.practitioner_price,
              retail_price: fsLab.retail_price || existingPanel.retail_price
            })
            .eq('id', existingPanel.id);

          if (!error) {
            syncedCount++;
            console.log(`Synced: ${existingPanel.name}`);
          } else {
            errorCount++;
            console.error(`Error syncing ${existingPanel.name}:`, error);
          }
        }
      } catch (err) {
        errorCount++;
        console.error(`Error processing lab ${fsLab.name}:`, err);
      }
    }

    // Log sync status
    await supabase
      .from('fullscript_sync_status')
      .insert({
        sync_type: 'labs',
        last_sync_at: new Date().toISOString(),
        sync_status: 'success',
        records_processed: syncedCount,
        error_message: errorCount > 0 ? `${errorCount} labs failed to sync` : null
      });

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        errors: errorCount,
        total: fullscriptLabs.length
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Sync error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to sync catalog'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);