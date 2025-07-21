// @ts-ignore - Deno edge function imports
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Deno edge function imports  
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
// @ts-ignore - Deno edge function imports
import { Resend } from "npm:resend@2.0.0";

// @ts-ignore - Deno global
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
  contactIds: string[];
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
      // @ts-ignore - Deno global
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore - Deno global
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

    const { campaignId, contactIds }: SendCampaignRequest = await req.json();

    console.log(`Processing campaign ${campaignId} for ${contactIds.length} contacts`);

    // Check email limits before proceeding
    // Get email count and limit from totalemailcounttable
    const { data: emailCountRecord, error: emailCountError } = await supabaseClient
      .from("totalemailcounttable")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let emailLimit = 125;
    let currentEmailCount = 0;

    if (emailCountRecord && !emailCountError) {
      emailLimit = emailCountRecord.email_limit || 125;
      currentEmailCount = emailCountRecord.total_count || 0;
      console.log(`User has sent ${currentEmailCount} emails from totalemailcounttable`);
    } else {
      // Create email count record if it doesn't exist
      const { data: newEmailRecord, error: createError } = await supabaseClient
        .from("totalemailcounttable")
        .insert([{
          user_id: user.id,
          total_count: 0,
          email_limit: 125
        }])
        .select()
        .single();

      if (createError) {
        console.error("Error creating email count record:", createError);
      } else {
        emailLimit = 125;
        currentEmailCount = 0;
      }
    }

    // Check if user can send the requested number of emails
    const emailsToSend = contactIds.length;
    const remainingEmails = emailLimit - currentEmailCount;

    if (emailsToSend > remainingEmails) {
      return new Response(
        JSON.stringify({
          error: "Email limit exceeded",
          message: `You can only send ${remainingEmails} more emails. You've used ${currentEmailCount} out of ${emailLimit} emails.`,
          current_usage: {
            used: currentEmailCount,
            limit: emailLimit,
            remaining: remainingEmails,
            percentage: Math.min(100, (currentEmailCount / emailLimit) * 100)
          }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("user_id", user.id)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found or unauthorized");
    }

    // Get contacts details
    const { data: contacts, error: contactsError } = await supabaseClient
      .from("contacts")
      .select("*")
      .in("id", contactIds)
      .eq("user_id", user.id);

    if (contactsError) {
      throw new Error("Failed to fetch contacts");
    }

    console.log(`Found ${contacts.length} contacts to send to`);

    // Create campaign_contacts entries for tracking
    const campaignContacts = contacts.map(contact => ({
      campaign_id: campaignId,
      contact_id: contact.id,
      user_id: user.id,
      status: 'pending'
    }));

    const { data: insertedContacts, error: insertError } = await supabaseClient
      .from("campaign_contacts")
      .insert(campaignContacts)
      .select();

    if (insertError) {
      console.error("Error creating campaign contacts:", insertError);
      throw new Error("Failed to create campaign tracking records");
    }

    console.log(`Created ${insertedContacts?.length || 0} campaign contact records`);

    // Process emails in batches to respect rate limits
    const batchSize = 10; // Send 10 emails at a time
    const delay = 1000; // 1 second delay between batches
    const results: Array<{
      success: boolean;
      contact: string;
      emailId?: string;
      error?: string;
    }> = [];
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(contacts.length / batchSize)}`);
      
      const batchPromises = batch.map(async (contact) => {
        try {
          // Find the corresponding campaign contact record
          const campaignContact = insertedContacts?.find(cc => cc.contact_id === contact.id);
          
          // Personalize the email content
          let personalizedSubject = campaign.subject
            .replace(/\{\{firstName\}\}/g, contact.first_name || '')
            .replace(/\{\{lastName\}\}/g, contact.last_name || '')
            .replace(/\{\{company\}\}/g, contact.company || '')
            .replace(/\{\{position\}\}/g, contact.position || '');

          let personalizedContent = campaign.content
            .replace(/\{\{firstName\}\}/g, contact.first_name || '')
            .replace(/\{\{lastName\}\}/g, contact.last_name || '')
            .replace(/\{\{company\}\}/g, contact.company || '')
            .replace(/\{\{position\}\}/g, contact.position || '');

          // Use a verified domain email address or fallback to onboarding@resend.dev
          const fromEmail = user.email && user.email.includes('@') && !user.email.includes('gmail.com') && !user.email.includes('yahoo.com') && !user.email.includes('hotmail.com')
            ? `${user.email.split('@')[0]} <${user.email}>`
            : `Cold Email Bot <onboarding@resend.dev>`;

          console.log(`Sending email to ${contact.email} from ${fromEmail}`);

          const emailResponse = await resend.emails.send({
            from: fromEmail,
            to: [contact.email],
            subject: personalizedSubject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                ${personalizedContent.replace(/\n/g, '<br>')}
                <br><br>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">
                  This email was sent as part of a cold email campaign. 
                  If you would like to unsubscribe, please reply with "UNSUBSCRIBE" in the subject line.
                </p>
              </div>
            `,
          });

          if (emailResponse.error) {
            console.error(`Resend API error for ${contact.email}:`, emailResponse.error);
            
            // Update campaign_contacts with failed status
            if (campaignContact) {
              await supabaseClient
                .from("campaign_contacts")
                .update({ 
                  status: 'failed',
                  sent_at: new Date().toISOString()
                })
                .eq("id", campaignContact.id);
            }

            return { 
              success: false, 
              contact: contact.email, 
              error: emailResponse.error.message || "Unknown Resend error"
            };
          }

          console.log(`Email sent successfully to ${contact.email}:`, emailResponse.data?.id);

          // Email count will be updated at the end of the batch processing

          // Update campaign_contacts with sent status
          if (campaignContact) {
            await supabaseClient
              .from("campaign_contacts")
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq("id", campaignContact.id);

            // Track the email event
            await supabaseClient
              .from("email_events")
              .insert({
                campaign_contact_id: campaignContact.id,
                event_type: 'sent',
                timestamp: new Date().toISOString(),
                metadata: {
                  email_id: emailResponse.data?.id,
                  personalized: true
                }
              });
          }

          return { 
            success: true, 
            contact: contact.email, 
            emailId: emailResponse.data?.id 
          };
        } catch (error: any) {
          console.error(`Failed to send email to ${contact.email}:`, error);
          
          // Update campaign_contacts with failed status
          const campaignContact = insertedContacts?.find(cc => cc.contact_id === contact.id);
          if (campaignContact) {
            await supabaseClient
              .from("campaign_contacts")
              .update({ 
                status: 'failed',
                sent_at: new Date().toISOString()
              })
              .eq("id", campaignContact.id);
          }

          return { 
            success: false, 
            contact: contact.email, 
            error: error.message 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < contacts.length) {
        console.log(`Waiting ${delay}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Campaign processing complete: ${successful} sent, ${failed} failed`);

    // Check if any emails failed due to domain verification issues
    const domainErrors = results.filter(r => 
      !r.success && r.error && r.error.includes("verify a domain")
    );

    let message = `Campaign emails processed: ${successful} sent, ${failed} failed`;
    
    if (domainErrors.length > 0) {
      message += `\n\nNote: Some emails failed due to domain verification. To send emails to any address, please verify your domain at https://resend.com/domains and update your profile email to use that domain.`;
    }

    // Update the email count in totalemailcounttable after sending
    let finalEmailCount = currentEmailCount + successful;
    try {
      if (successful > 0) {
        const { data: updatedRecord, error: updateError } = await supabaseClient
          .from("totalemailcounttable")
          .update({ total_count: finalEmailCount })
          .eq("user_id", user.id)
          .select()
          .single();
        
        if (!updateError && updatedRecord) {
          finalEmailCount = updatedRecord.total_count;
          console.log(`Updated email count in totalemailcounttable: ${finalEmailCount}`);
        }
      }
    } catch (countError) {
      console.warn("Could not update count in totalemailcounttable:", countError);
    }

    return new Response(
      JSON.stringify({
        message,
        results,
        successful,
        failed,
        domainVerificationRequired: domainErrors.length > 0,
        email_usage: {
          used: finalEmailCount,
          limit: emailLimit,
          remaining: emailLimit - finalEmailCount,
          percentage: Math.min(100, (finalEmailCount / emailLimit) * 100)
        }
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
    console.error("Error in send-campaign-emails function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "Failed to process campaign emails"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler); 