import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SupplementRequest {
  supplementNames: string[];
  patientId?: string;
}

interface SupplementProduct {
  name: string;
  brand: string;
  price: number;
  url: string;
  fullscriptId?: string;
  description?: string;
  form?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { supplementNames, patientId }: SupplementRequest = await req.json();

    if (!supplementNames || supplementNames.length === 0) {
      throw new Error('No supplement names provided');
    }

    console.log('Fetching supplement recommendations for:', supplementNames);

    const fullscriptApiKey = Deno.env.get('FULLSCRIPT_API_KEY');
    
    let recommendations: SupplementProduct[] = [];

    if (fullscriptApiKey) {
      // Try to fetch real products from Fullscript API
      try {
        for (const supplementName of supplementNames) {
          const searchResponse = await fetch(`https://api.fullscript.com/api/v1/products/search?q=${encodeURIComponent(supplementName)}&limit=3`, {
            headers: {
              'Authorization': `Bearer ${fullscriptApiKey}`,
              'Accept': 'application/json'
            }
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.data && searchData.data.length > 0) {
              const product = searchData.data[0]; // Get the best match
              
              recommendations.push({
                name: product.name || supplementName,
                brand: product.brand?.name || 'Professional Grade',
                price: product.price?.amount || 2999, // Default price in cents
                url: `https://supplements.fullscript.com/products/${product.id}`,
                fullscriptId: product.id,
                description: product.description,
                form: product.form
              });
            }
          }
        }
      } catch (apiError) {
        console.error('Fullscript API search error:', apiError);
        // Fall back to database lookup
      }
    }

    // If no results from API or no API key, use database supplement products
    if (recommendations.length === 0) {
      console.log('Using database supplement products as fallback');
      
      const { data: dbProducts, error: dbError } = await supabase
        .from('supplement_products')
        .select('*')
        .or(
          supplementNames.map(name => 
            `name.ilike.%${name}%,ingredients.cs.["${name}"]`
          ).join(',')
        )
        .eq('is_active', true)
        .limit(supplementNames.length * 2);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      recommendations = (dbProducts || []).map(product => ({
        name: product.name,
        brand: product.brand,
        price: product.price_cents || 2999,
        url: product.deep_link_url || `https://supplements.labpilot.com/products/${encodeURIComponent(product.name)}`,
        fullscriptId: product.fullscript_id,
        description: product.description,
        form: product.form
      }));
    }

    // If still no results, create generic recommendations
    if (recommendations.length === 0) {
      recommendations = supplementNames.map(name => ({
        name: name,
        brand: 'Professional Grade',
        price: 2999, // $29.99
        url: `https://supplements.labpilot.com/search?q=${encodeURIComponent(name)}`,
        description: `Professional-grade ${name} supplement`,
        form: 'capsule'
      }));
    }

    console.log(`Found ${recommendations.length} supplement recommendations`);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        total: recommendations.length
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
    console.error('Error in get-supplement-recommendations function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to get supplement recommendations'
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