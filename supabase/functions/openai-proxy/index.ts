// @deno-types="https://deno.land/x/types/index.d.ts"
declare const Deno: any;

// @ts-ignore - Deno runtime module
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Deno runtime module  
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface OpenAIRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }), 
      { 
        status: 405, 
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      }
    );
  }

  try {
    // Verify authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Parse request body
    const requestBody: OpenAIRequest = await req.json();

    // Validate request
    if (!requestBody.model || !requestBody.messages) {
      throw new Error("Invalid request: model and messages are required");
    }

    // Make request to OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: requestBody.model,
        messages: requestBody.messages,
        temperature: requestBody.temperature || 0.7,
        max_tokens: requestBody.max_tokens || 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await openaiResponse.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error('OpenAI proxy error:', error);
    
    // Determine appropriate status code based on error type
    let status = 500;
    let errorMessage = "Internal server error";
    
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized") || error.message.includes("No authorization header")) {
        status = 401;
        errorMessage = "Authentication required";
      } else if (error.message.includes("OpenAI API key not configured")) {
        status = 503;
        errorMessage = "Service temporarily unavailable";
      } else if (error.message.includes("Invalid request")) {
        status = 400;
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
};

serve(handler); 