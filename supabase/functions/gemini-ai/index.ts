// Supabase Edge Function: gemini-ai
// Invoked securely by authorized frontend clients with JWT.
// Server-side only: uses Deno.env.get('GEMINI_API_KEY') to communicate with Gemini API.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, text, term, recordType } = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY is not configured on the Supabase Edge Function environment.',
          isConfigured: false,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    const systemInstruction = `You are E-Health Clinical Assistant, an educational medical assistant for patients.
Rules:
1. Explain medical terms, dosage timings, and test reference ranges in calm, clear plain language.
2. NEVER make a diagnosis or prescribe treatments.
3. NEVER tell a patient to stop, start, or change medication dosages.
4. Always end with: "Disclaimer: This explanation is for educational purposes only. Always consult your attending doctor regarding your medical care."`;

    if (action === 'explain_term') {
      prompt = `${systemInstruction}\n\nPlease explain the medical term "${term}" in simple, reassuring language for a patient.`;
    } else if (action === 'explain_prescription') {
      prompt = `${systemInstruction}\n\nHere is a prescription note:\n"${text}"\n\nExplain what the medicines generally do, what the schedule instructions mean, and standard precautions.`;
    } else if (action === 'explain_report') {
      prompt = `${systemInstruction}\n\nHere are lab findings:\n"${text}"\n\nExplain what these tests measure and general physiological ranges in plain terms.`;
    } else {
      prompt = `${systemInstruction}\n\nPlease explain this medical text:\n"${text}"`;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const geminiData = await geminiRes.json();
    const explanation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return new Response(
      JSON.stringify({
        success: true,
        explanation,
        disclaimer: 'AI-generated information is for educational purposes only. Always verify medical information with your healthcare professional and the original medical document.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal AI service error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
