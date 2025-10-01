import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import MASTER_PROMPT from './master-prompt.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, labContent, userProfile } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) throw orderError

    // If labContent not provided, fetch from storage
    let labData = labContent
    if (!labContent && order.lab_file_url) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('lab-results')
        .download(order.lab_file_url)
      
      if (fileError) throw fileError
      labData = await fileData.text()
    }

    // Choose AI provider based on environment variable
    const aiProvider = Deno.env.get('AI_PROVIDER') || 'openai'
    let aiResponse
    
    if (aiProvider === 'anthropic') {
      // Claude API
      aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 8000,
          temperature: 0.3,
          system: MASTER_PROMPT,
          messages: [{
            role: "user",
            content: JSON.stringify({
              labResults: labData,
              userProfile: userProfile || {
                age: order.user_age || 'unknown',
                biologicalSex: order.user_sex || 'unknown',
                healthGoals: order.health_goals || []
              }
            })
          }]
        })
      })
    } else {
      // OpenAI API
      aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: MASTER_PROMPT
            },
            {
              role: "user",
              content: JSON.stringify({
                labResults: labData,
                userProfile: userProfile || {
                  age: order.user_age || 'unknown',
                  biologicalSex: order.user_sex || 'unknown',
                  healthGoals: order.health_goals || []
                }
              })
            }
          ],
          temperature: 0.3,
          max_tokens: 8000,
          response_format: { type: "json_object" }
        })
      })
    }

    if (!aiResponse.ok) {
      throw new Error(`AI analysis error: ${await aiResponse.text()}`)
    }

    const aiData = await aiResponse.json()
    
    // Parse response based on provider
    let analysis
    if (aiProvider === 'anthropic') {
      analysis = JSON.parse(aiData.content[0].text)
    } else {
      analysis = JSON.parse(aiData.choices[0].message.content)
    }

    // Add Fullscript dispensary links to supplements
    const dispensaryId = Deno.env.get('FULLSCRIPT_DISPENSARY_ID') || 'drzachconner'
    if (analysis.supplements && Array.isArray(analysis.supplements)) {
      analysis.supplements = analysis.supplements.map(supplement => ({
        ...supplement,
        fullscriptSignupUrl: `https://us.fullscript.com/welcome/${dispensaryId}`,
        fullscriptSearchUrl: `https://us.fullscript.com/${dispensaryId}/catalog/search?query=${encodeURIComponent(supplement.searchTerm)}`,
        clickable: true
      }))
    }

    // Add dispensary info
    analysis.dispensaryInfo = {
      signupRequired: true,
      signupUrl: `https://us.fullscript.com/welcome/${dispensaryId}`,
      dispensaryName: Deno.env.get('FULLSCRIPT_PRACTITIONER_NAME') || 'Dr. Zach Conner'
    }

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('lab_analyses')
      .insert({
        order_id: orderId,
        user_id: order.user_id,
        analysis_data: analysis,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) throw saveError

    // Update order status
    await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        analysis_id: savedAnalysis.id 
      })
      .eq('id', orderId)

    // Track supplement recommendations
    if (analysis.supplements && analysis.supplements.length > 0) {
      const supplementTracking = analysis.supplements.map(supp => ({
        analysis_id: savedAnalysis.id,
        supplement_name: supp.supplementName,
        search_term: supp.searchTerm,
        dosage: supp.dosage,
        risk_level: supp.riskLevel,
        category: supp.category
      }))

      await supabase
        .from('supplement_tracking')
        .insert(supplementTracking)
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        analysisId: savedAnalysis.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Analysis error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})