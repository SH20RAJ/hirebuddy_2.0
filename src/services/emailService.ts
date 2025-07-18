import { EnvironmentValidator, SecureErrorHandler, InputValidator, InputSanitizer } from '../utils/security';
import { supabase } from '@/lib/supabase';

export interface EmailSendRequest {
  sender: string;
  to: string;
  subject: string;
  body: string;
  attachment_path?: string;
}

export interface FollowUpRequest {
  sender: string;
  body: string;
  to: string;
  subject?: string;
}

export interface EmailConversationRequest {
  sender: string;
  to: string;
}

export interface EmailSendResponse {
  messageId: string;
  threadId: string;
  subject: string;
}

export interface EmailConversation {
  id: string;
  subject: string;
  from: string;
  to?: string;
  date: string;
  body: string;
  thread_id?: string;
  metadata?: any;
}

export interface ContactInfo {
  name: string;
  email: string;
  company?: string;
  position?: string;
  linkedin_link?: string;
}

export interface UserProfileData {
  full_name?: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  college?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  phone?: string;
  available_for_work?: boolean;
  experiences?: Array<{
    job_title: string;
    company: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
    achievements?: string[];
    skills_used?: string[];
  }>;
}

export interface AIEmailGenerationRequest {
  contact: ContactInfo;
  userProfile: UserProfileData;
  emailType: 'cold_outreach' | 'follow_up' | 'job_application' | 'networking' | 'partnership';
  customInstructions?: string;
  tone?: 'professional' | 'friendly' | 'formal' | 'casual';
  targetRoles?: string[];
}

export interface AIEmailResponse {
  subject: string;
  body: string;
  reasoning?: string;
}

class EmailService {
  private apiBaseUrl: string;
  private openaiProxyUrl: string;

  constructor() {
    // Use secure environment variable access
    try {
      this.apiBaseUrl = EnvironmentValidator.getSecureEnvVar('VITE_AWS_API_BASE_URL');
      this.openaiProxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`;
    } catch (error) {
      throw SecureErrorHandler.createSafeError(
        error,
        'Email service configuration error. Please check your environment variables.'
      );
    }
  }

  /**
   * Send an email using the AWS API
   */
  async sendEmail(request: EmailSendRequest): Promise<EmailSendResponse> {
    try {
      // Input validation and sanitization
      if (!InputValidator.isValidEmail(request.to)) {
        throw new Error('Invalid recipient email address');
      }
      if (!InputValidator.isValidEmail(request.sender)) {
        throw new Error('Invalid sender email address');
      }
      if (!InputValidator.isSafeText(request.subject)) {
        throw new Error('Invalid characters in email subject');
      }
      if (!InputValidator.isSafeText(request.body)) {
        throw new Error('Invalid characters in email body');
      }



      // Sanitize inputs
              const sanitizedRequest = {
          ...request,
          to: InputSanitizer.sanitizeEmail(request.to),
          sender: InputSanitizer.sanitizeEmail(request.sender),
          subject: InputSanitizer.sanitizeText(request.subject),
          body: InputSanitizer.sanitizeText(request.body)
        };

      console.log('🚀 Sending email via AWS API...', { 
        to: sanitizedRequest.to, 
        subject: sanitizedRequest.subject,
        sender: sanitizedRequest.sender 
      });

      const response = await fetch(`${this.apiBaseUrl}/send_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        },
        body: JSON.stringify(sanitizedRequest),
      });

      console.log('📡 AWS API Response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AWS API Error:', { status: response.status, error: errorText });
        
        // Provide more specific error messages based on status codes
        if (response.status === 400) {
          throw new Error(`Invalid request: ${errorText}`);
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API credentials.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please check your permissions.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        } else {
          throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Email sent successfully:', data);
      
      // Handle different response types
      if (typeof data === 'string') {
        // Handle string responses like "Upgrade your plan. Email limit reached."
        throw new Error(data);
      }

      return data as EmailSendResponse;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      
      // Use secure error handling to prevent information leakage
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw SecureErrorHandler.createSafeError(error, 'Unable to connect to email service. Please check your internet connection.');
      }
      
      // Check if error message is safe to show to user
      if (error instanceof Error && SecureErrorHandler.isSafeErrorMessage(error.message)) {
        throw error;
      }
      
      // For any other errors, return a generic message
      throw SecureErrorHandler.createSafeError(error, 'Failed to send email. Please try again later.');
    }
  }

  /**
   * Send a follow-up email using the AWS API
   */
  async sendFollowUp(request: FollowUpRequest): Promise<{ message: string }> {
    try {
      console.log('🚀 Sending follow-up email via AWS API...', { 
        to: request.to, 
        sender: request.sender 
      });

      const response = await fetch(`${this.apiBaseUrl}/send_followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 AWS API Follow-up Response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AWS API Follow-up Error:', { status: response.status, error: errorText });
        
        // Provide more specific error messages based on status codes
        if (response.status === 400) {
          throw new Error(`Invalid follow-up request: ${errorText}`);
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API credentials.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please check your permissions.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        } else {
          throw new Error(`Failed to send follow-up: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Follow-up sent successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error sending follow-up:', error);
      
      // Re-throw with more context if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to email service. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  /**
   * Get email conversation and replies using the Gmail API backend
   */
  async getEmailConversation(request: EmailConversationRequest): Promise<EmailConversation[]> {
    try {
      console.log('Calling backend API for conversation:', request);
      
      const response = await fetch(`${this.apiBaseUrl}/get_email_and_replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend API error:', errorText);
        throw new Error(`Failed to get conversation: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw backend response:', data);
      
      // Handle different response formats from the backend
      let emails: any[] = [];
      
      if (Array.isArray(data)) {
        emails = data;
      } else if (data && typeof data === 'object') {
        // Handle case where backend returns an object with conversation data
        if (data.messages) {
          emails = data.messages;
        } else if (data.emails) {
          emails = data.emails;
        } else if (data.conversation) {
          emails = data.conversation;
        } else {
          // Single email response
          emails = [data];
        }
      }
      
      console.log('Processed emails array:', emails);
      
      // Transform the backend response to match our EmailConversation interface
      const transformedEmails = emails.map((email: any, index: number) => {
        // Handle different possible field names from the backend
        const messageId = email.id || email.messageId || email.message_id || `msg-${index}`;
        const subject = email.subject || email.Subject || 'No Subject';
        const fromEmail = email.from || email.From || email.sender || email.sender_email || '';
        const toEmail = email.to || email.To || email.recipient || email.recipient_email || '';
        const body = email.body || email.Body || email.content || email.snippet || '';
        const date = email.date || email.Date || email.sent_at || email.internalDate || new Date().toISOString();
        
        // Additional metadata that might be useful
        const threadId = email.threadId || email.thread_id || email.labelIds;
        
        console.log('Transforming email:', {
          messageId,
          subject,
          fromEmail,
          toEmail,
          body: body.substring(0, 100) + '...',
          date
        });

        return {
          id: messageId,
          subject: subject,
          from: fromEmail,
          to: toEmail,
          date: date,
          body: body,
          thread_id: threadId,
          metadata: {
            original_data: email
          }
        };
      });
      
      console.log('Final transformed emails:', transformedEmails.length);
      return transformedEmails;
      
    } catch (error) {
      console.error('Error getting email conversation:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // First try a simple GET request to the root endpoint
      const rootResponse = await fetch(`${this.apiBaseUrl}/`, {
        method: 'GET',
      });

      if (rootResponse.ok) {
        const data = await rootResponse.json();
        return {
          success: true,
          message: data.message || 'AWS Email API connection successful'
        };
      }

      // If root endpoint fails, try the send_email endpoint with test data
      const response = await fetch(`${this.apiBaseUrl}/send_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'test@example.com',
          to: 'test@example.com',
          subject: 'Test Connection',
          body: 'Testing API connectivity'
        }),
      });

      // Consider 400, 422, and 500 as successful connections (API is responding)
      // These indicate the API is working but our test data doesn't meet requirements
      if (response.status === 400 || response.status === 422 || response.status === 500) {
        return {
          success: true,
          message: 'AWS Email API connection successful (API reachable and responding)'
        };
      }

      if (response.ok) {
        return {
          success: true,
          message: 'AWS Email API connection successful'
        };
      }

      const errorText = await response.text();
      return {
        success: false,
        message: `API connection failed: ${response.status} - ${errorText}`
      };
    } catch (error) {
      return {
        success: false,
        message: `API connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate AI-powered personalized email content using OpenAI 4o-mini
   */
  async generateAIEmail(request: AIEmailGenerationRequest): Promise<AIEmailResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.emailType, request.tone || 'professional');
      const userPrompt = this.buildUserPrompt(request);

              // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('Authentication required for AI features');
        }

        const response = await fetch(this.openaiProxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 1,
          max_tokens: 2048,
          top_p: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || '';

      // Parse the AI response to extract subject and body
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Error generating AI email:', error);
      throw error;
    }
  }

  /**
   * Build system prompt based on email type and tone
   */
  private buildSystemPrompt(emailType: string, tone: string): string {
    return `You are an expert cold email copywriter helping job seekers write short, impactful cold emails to recruiters, HRs, or startup founders.

Your task is to generate a concise, human-sounding cold email that fits within one screen (max 150–180 words). The language should match the selected tone (e.g., professional, formal, friendly, or casual) and remain clear and readable.

Additional rules:
- Always personalize the greeting with the recipient's name and company (if provided).
- If a LinkedIn profile of the recipient is provided, use a slightly warmer tone.
- Be humble and authentic in tone — never overhype.
- Do not use long paragraphs or fluff. Keep it structured and skimmable.
- Highlight the sender's skills clearly.
- If available, use the recipient company website to justify the sender's interest in them.

Structure the email in the following format:

1. **Opening Paragraph** – Introduce the sender: who they are, their current role, education background, and interest in the recipient's company. If the company website is provided, include a short line about why the sender is reaching out (e.g., "I came across your work at {{recipient_company}} and was impressed by...").

2. **Middle Paragraph** – Highlight the sender's top skills, years of experience, and recent work (2–3 notable roles or achievements). Focus on relevant experience tied to the target role.

3. **Closing Paragraph** – Include a short, polite call to action. Invite them to connect or refer to the sender's resume.

4. **Email Signature** – Format it exactly as follows:
   - Line 1: {{sender_name}}
   - Line 2: {{senders_education}}
   - Line 3: {{senders_phone}}
   - Line 4: {{senders_linkedin}}

RESPONSE FORMAT:
You must respond in this exact JSON format:
{
  "subject": "Compelling subject line here",
  "body": "Email body here with proper line breaks using \\n\\n for paragraphs",
  "reasoning": "Brief explanation of personalization choices"
}`;
  }

  /**
   * Build user prompt with contact and profile information
   */
  private buildUserPrompt(request: AIEmailGenerationRequest): string {
    const { contact, userProfile, customInstructions, targetRoles } = request;

    let prompt = `TONE: ${request.tone || 'professional'}
TARGET ROLE: ${targetRoles && targetRoles.length > 0 ? targetRoles.join(', ') : 'General Opportunities'}
CUSTOM INSTRUCTIONS: ${customInstructions || 'None'}

RECIPIENT INFORMATION:
- Name: ${contact.name}
- Company: ${contact.company || 'N/A'}
- Position: ${contact.position || 'N/A'}
- LinkedIn: ${contact.linkedin_link || 'N/A'}
- Company_website: N/A

SENDER INFORMATION:
- Name: ${userProfile.full_name || 'N/A'}
- Current Title: ${userProfile.title || 'N/A'}
- Current Company: ${userProfile.company || 'N/A'}
- Location: ${userProfile.location || 'N/A'}
- Education: ${userProfile.college || 'N/A'}
- Years of Experience: ${userProfile.experience_years || 'N/A'}
- Available for Work: ${userProfile.available_for_work !== undefined ? (userProfile.available_for_work ? 'Yes' : 'No') : 'N/A'}
- Phone: ${userProfile.phone || 'N/A'}
- Resume Link: N/A
- Key Skills: ${userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills.slice(0, 8).join(', ') : 'N/A'}`;

    // Add work experience information
    if (userProfile.experiences && userProfile.experiences.length > 0) {
      const recentExperiences = userProfile.experiences.slice(0, 3);
      let workExText = '';
      
      recentExperiences.forEach((exp, index) => {
        workExText += `${index + 1}. ${exp.job_title} at ${exp.company}`;
        if (exp.start_date || exp.end_date) {
          const startDate = exp.start_date ? new Date(exp.start_date).getFullYear() : 'Unknown';
          const endDate = exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).getFullYear() : 'Unknown');
          workExText += ` (${startDate} - ${endDate})`;
        }
        
        if (exp.description) {
          const shortDescription = exp.description.length > 100 
            ? exp.description.substring(0, 100) + '...' 
            : exp.description;
          workExText += ` - ${shortDescription}`;
        }
        
        if (exp.achievements && exp.achievements.length > 0) {
          const topAchievements = exp.achievements.slice(0, 2);
          workExText += ` Key achievements: ${topAchievements.join('; ')}`;
        }
        
        if (index < recentExperiences.length - 1) workExText += '; ';
      });
      
      prompt += `\n- Work Experience: ${workExText}`;
    } else {
      prompt += `\n- Work Experience: N/A`;
    }

    return prompt;
  }

  /**
   * Parse AI response to extract subject and body
   */
  private parseAIResponse(aiResponse: string): AIEmailResponse {
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = aiResponse.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
      
      const parsed = JSON.parse(jsonString);
      
      if (!parsed.subject || !parsed.body) {
        throw new Error('Invalid AI response format');
      }

      return {
        subject: parsed.subject,
        body: parsed.body,
        reasoning: parsed.reasoning || ''
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback: try to extract subject and body manually
      const lines = aiResponse.split('\n').filter(line => line.trim());
      const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
      const subject = subjectLine ? subjectLine.replace(/subject:/i, '').trim() : 'Follow-up';
      
      // Use the full response as body if parsing fails
      const body = aiResponse.includes('{') ? 
        'Hi ' + (aiResponse.includes('Hi') ? aiResponse.split('Hi')[1] : aiResponse) :
        aiResponse;

      return {
        subject,
        body: body.trim(),
        reasoning: 'AI response parsing failed, using fallback format'
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async generateEmailContent(companyName: string, founderName: string): Promise<{ subject: string; body: string }> {
    const template = {
      subject: `Partnership Opportunity - ${companyName}`,
      body: `Hi ${founderName},

I hope this email finds you well. I'm reaching out because I believe there might be a great opportunity for collaboration between ${companyName} and Hirebuddy.

Hirebuddy is a job search and automation platform with a growing community of 10,000+ students and working professionals. We collaborate with top-tier institutions like Master's Union and Tetr School of Business, and have successfully helped numerous companies hire qualified talent quickly and efficiently.

I'd love to explore how we can work together to help ${companyName} find the right talent while providing our community with exciting opportunities.

Would you be open to a brief 15-minute call this week to discuss this further?

Best regards,
Sarvagya Kulshreshtha
Co-Founder, Hirebuddy (https://hirebuddy.net)
Phone: +91 92893 93231
Email: kulshreshthasarv@gmail.com`
    };

    return template;
  }

  /**
   * Validate email address format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format email body as HTML
   */
  formatAsHtml(plainText: string): string {
    return plainText
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }
}

export const emailService = new EmailService();
export default emailService; 