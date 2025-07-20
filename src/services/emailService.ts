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
    if (emailType === 'follow_up') {
      return `You are an expert email writer specializing in professional follow-up communications.

OBJECTIVE: Create a concise, compelling follow-up email (2-3 sentences max).

REQUIREMENTS:
- Personalize with recipient's name and company
- Reference the initial outreach subtly
- Include a clear, soft call-to-action
- Keep tone ${tone} but professional
- Be brief and respectful of their time

OUTPUT FORMAT:
{
  "subject": "Brief, compelling subject line",
  "body": "Email body with \\n\\n for paragraph breaks",
  "reasoning": "Brief explanation of personalization strategy"
}`;
    }

    return `You are an expert cold email copywriter for job seekers targeting recruiters, hiring managers, and startup founders.

OBJECTIVE: Create a compelling, personalized cold email (100-150 words max) that generates responses.

EMAIL STRUCTURE:
1. OPENER (1 sentence): Personal greeting + specific company detail/achievement
2. INTRODUCTION (2 sentences): Who you are + relevant background
3. VALUE PROPOSITION (2 sentences): Key skills/experience relevant to their needs
4. CALL TO ACTION (1 sentence): Clear, low-pressure request

REQUIREMENTS:
- Tone: ${tone}
- Use recipient's name and company details
- Highlight sender's most relevant skills and experience
- Include proper email signature with contact details
- Be specific and avoid generic phrases
- Focus on value you can bring to their organization

SIGNATURE FORMAT:
{{sender_name}}
{{sender_education}}
{{sender_phone}}
{{sender_linkedin}}

OUTPUT FORMAT:
{
  "subject": "Compelling, specific subject line",
  "body": "Email body with \\n\\n for paragraph breaks and proper signature",
  "reasoning": "Brief explanation of personalization choices"
}`;
  }

  /**
   * Build user prompt with contact and profile information
   */
  private buildUserPrompt(request: AIEmailGenerationRequest): string {
    const { contact, userProfile, customInstructions, targetRoles } = request;

    // Enhanced follow-up prompt
    if (request.emailType === 'follow_up') {
      return `CONTEXT:
Target Role: ${targetRoles?.join(', ') || 'General Opportunities'}
Tone: ${request.tone || 'professional'}
Custom Instructions: ${customInstructions || 'None'}

RECIPIENT:
Name: ${contact.name}
Company: ${contact.company || 'Company not specified'}
Position: ${contact.position || 'Position not specified'}
LinkedIn: ${contact.linkedin_link ? 'Available' : 'Not available'}

SENDER:
Name: ${userProfile.full_name || 'User'}
Current Role: ${userProfile.title || 'Job Seeker'}
Location: ${userProfile.location || 'Location not specified'}
Phone: ${userProfile.phone || 'Phone not provided'}
LinkedIn: ${userProfile.linkedin || 'LinkedIn not provided'}

Generate a brief follow-up referencing the initial email about job opportunities.`;
    }

    // Enhanced regular email prompt with structured data
    const workExperience = this.formatWorkExperience(userProfile.experiences);
    const skillsSummary = this.formatSkills(userProfile.skills);
    
    return `CONTEXT:
Target Roles: ${targetRoles?.join(', ') || 'General Opportunities'}
Tone: ${request.tone || 'professional'}
Custom Instructions: ${customInstructions || 'Standard job application outreach'}

RECIPIENT DATA:
Name: ${contact.name}
Company: ${contact.company || 'Company not available'}
Position: ${contact.position || 'Position not available'}
LinkedIn Profile: ${contact.linkedin_link ? 'Available for personalization' : 'Not available'}

SENDER PROFILE:
Name: ${userProfile.full_name || 'User'}
Current Position: ${userProfile.title || 'Job Seeker'}
Current Company: ${userProfile.company || 'Currently seeking opportunities'}
Location: ${userProfile.location || 'Location flexible'}
Education: ${userProfile.college || 'Educational background available'}
Experience Level: ${userProfile.experience_years || 0} years
Available for Work: ${userProfile.available_for_work ? 'Immediately' : 'Open to opportunities'}
Phone: ${userProfile.phone || 'Available upon request'}
LinkedIn: ${userProfile.linkedin || 'LinkedIn profile available'}
Professional Website: ${userProfile.website || 'Portfolio available upon request'}

SKILLS PROFILE:
${skillsSummary}

RECENT WORK EXPERIENCE:
${workExperience}

SIGNATURE VARIABLES:
{{sender_name}} = ${userProfile.full_name || 'User'}
{{sender_education}} = ${userProfile.college || 'Educational Background Available'}
{{sender_phone}} = ${userProfile.phone || 'Phone Available Upon Request'}
{{sender_linkedin}} = ${userProfile.linkedin || 'LinkedIn Profile Available'}

Generate a personalized email leveraging this data for maximum relevance.`;
  }

  /**
   * Format work experience for prompt
   */
  private formatWorkExperience(experiences?: Array<any>): string {
    if (!experiences || experiences.length === 0) {
      return 'Fresh graduate or career changer seeking new opportunities';
    }

    return experiences.slice(0, 2).map((exp, index) => {
      const duration = this.formatExperienceDuration(exp.start_date, exp.end_date, exp.is_current);
      const achievements = exp.achievements?.slice(0, 2).join('; ') || '';
      const keySkills = exp.skills_used?.slice(0, 4).join(', ') || '';
      
      return `${index + 1}. ${exp.job_title} at ${exp.company} (${duration})
   Key Skills: ${keySkills}
   Top Achievements: ${achievements}
   ${exp.description ? exp.description.substring(0, 120) + '...' : ''}`;
    }).join('\n\n');
  }

  /**
   * Format skills for prompt
   */
  private formatSkills(skills?: string[]): string {
    if (!skills || skills.length === 0) {
      return 'Diverse skill set with strong learning ability';
    }

    const topSkills = skills.slice(0, 8).join(', ');
    return `Core Competencies: ${topSkills}${skills.length > 8 ? ' and more' : ''}`;
  }

  /**
   * Format experience duration
   */
  private formatExperienceDuration(startDate?: string, endDate?: string, isCurrent?: boolean): string {
    if (!startDate) return 'Duration available';
    
    const start = new Date(startDate).getFullYear();
    const end = isCurrent ? 'Present' : (endDate ? new Date(endDate).getFullYear() : 'Present');
    
    return `${start} - ${end}`;
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