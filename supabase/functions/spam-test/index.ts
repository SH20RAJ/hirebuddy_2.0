import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SpamTestRequest {
  campaignId: string;
  subject: string;
  content: string;
}

interface SpamTestIssue {
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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

    const { campaignId, subject, content }: SpamTestRequest = await req.json();

    // Perform spam analysis
    const issues: SpamTestIssue[] = [];
    let score = 10; // Start with perfect score

    // Check subject line
    const spamWords = ['FREE', 'URGENT', 'LIMITED TIME', 'CLICK NOW', 'GUARANTEED', 'AMAZING', 'INCREDIBLE'];
    const subjectUpper = subject.toUpperCase();
    
    spamWords.forEach(word => {
      if (subjectUpper.includes(word)) {
        issues.push({
          severity: 'high',
          message: `Subject contains spam trigger word: "${word}"`,
          suggestion: 'Remove or replace spam trigger words with more natural language'
        });
        score -= 2;
      }
    });

    // Check subject length
    if (subject.length > 50) {
      issues.push({
        severity: 'medium',
        message: 'Subject line is too long (over 50 characters)',
        suggestion: 'Keep subject lines under 50 characters for better deliverability'
      });
      score -= 0.5;
    }

    if (subject.length < 10) {
      issues.push({
        severity: 'medium',
        message: 'Subject line is too short (under 10 characters)',
        suggestion: 'Make subject lines more descriptive with 10-50 characters'
      });
      score -= 0.5;
    }

    // Check excessive caps
    const capsPercentage = (subject.match(/[A-Z]/g) || []).length / subject.length;
    if (capsPercentage > 0.3) {
      issues.push({
        severity: 'high',
        message: 'Too many capital letters in subject line',
        suggestion: 'Use normal sentence case to avoid appearing spammy'
      });
      score -= 1.5;
    }

    // Check content issues
    const contentUpper = content.toUpperCase();
    
    // Check for excessive exclamation marks
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      issues.push({
        severity: 'medium',
        message: 'Too many exclamation marks in content',
        suggestion: 'Limit exclamation marks to maintain professional tone'
      });
      score -= 1;
    }

    // Check for spam phrases in content
    const contentSpamPhrases = ['CLICK HERE', 'CALL NOW', 'ORDER NOW', 'BUY NOW', 'SPECIAL PROMOTION'];
    contentSpamPhrases.forEach(phrase => {
      if (contentUpper.includes(phrase)) {
        issues.push({
          severity: 'medium',
          message: `Content contains potential spam phrase: "${phrase}"`,
          suggestion: 'Use more natural call-to-action language'
        });
        score -= 1;
      }
    });

    // Check for missing unsubscribe
    if (!contentUpper.includes('UNSUBSCRIBE')) {
      issues.push({
        severity: 'high',
        message: 'Missing unsubscribe link',
        suggestion: 'Include a clear unsubscribe link to comply with regulations'
      });
      score -= 2;
    }

    // Check text-to-HTML ratio (simplified check)
    const textLength = content.replace(/<[^>]*>/g, '').length;
    const htmlLength = content.length;
    const textRatio = textLength / htmlLength;
    
    if (textRatio < 0.3) {
      issues.push({
        severity: 'medium',
        message: 'Low text-to-HTML ratio',
        suggestion: 'Include more text content relative to HTML tags for better deliverability'
      });
      score -= 1;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Save test result
    const { data: testResult, error } = await supabaseClient
      .from('spam_test_results')
      .insert({
        campaign_id: campaignId,
        score: Math.round(score * 10) / 10, // Round to 1 decimal place
        issues: issues,
        tested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving spam test result:", error);
    }

    return new Response(
      JSON.stringify({
        id: testResult?.id || crypto.randomUUID(),
        campaign_id: campaignId,
        score: Math.round(score * 10) / 10,
        issues: issues,
        tested_at: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in spam-test function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler); 