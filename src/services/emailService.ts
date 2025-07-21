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
          temperature: 0.7,
          max_tokens: 1500,
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
    const basePrompt = `You are a professional email writing assistant specializing in creating short, simple, and effective emails for job seekers and professionals. Your emails should be:

1. ULTRA-CONCISE - Keep it extremely brief (80-120 words max, 3-4 sentences ideal)
2. SIMPLE - Use simple language, avoid jargon or complex terms
3. DIRECT - Get straight to the point without unnecessary fluff
4. PERSONALIZED - Use specific details about the recipient when available
5. ACTION-ORIENTED - Include ONE clear, simple call to action

TONE: ${tone}
EMAIL TYPE: ${emailType}

CRITICAL REQUIREMENTS:
- Maximum 120 words total (excluding signature)
- Use 2-3 short paragraphs maximum
- Subject line must be 4-6 words only
- Include clickable links in proper HTML format: <a href="URL">Link Text</a>
- End with ONE simple call to action
- Avoid buzzwords, corporate speak, or lengthy explanations
- Make every word count - remove unnecessary adjectives and filler

LINK FORMATTING:
- LinkedIn profiles: <a href="linkedin_url">LinkedIn Profile</a>
- Websites: <a href="website_url">Portfolio</a> or <a href="website_url">Website</a>
- GitHub: <a href="github_url">GitHub</a>
- Always ensure links are properly formatted and clickable

RESPONSE FORMAT:
You must respond in this exact JSON format:
{
  "subject": "Short subject (4-6 words)",
  "body": "Ultra-concise email body with proper HTML links using <a href='URL'>Text</a> format and \\n\\n for paragraphs",
  "reasoning": "Brief explanation of choices"
}`;

    const typeSpecificGuidelines = {
      'cold_outreach': 'One sentence intro, one key skill/achievement, simple call to action. Keep it under 100 words.',
      'follow_up': 'Brief reference to previous contact, one new value point, direct ask. Maximum 80 words.',
      'job_application': 'State interest in role, highlight ONE relevant skill/experience, request interview. Stay under 100 words.',
      'networking': 'Mention connection/shared interest, brief value proposition, suggest quick call. Keep to 90 words max.',
      'partnership': 'State partnership interest, ONE key benefit, propose brief discussion. Maximum 100 words.'
    };

    return `${basePrompt}\n\nSPECIFIC GUIDELINES FOR ${emailType.toUpperCase()}:\n${typeSpecificGuidelines[emailType as keyof typeof typeSpecificGuidelines]}`;
  }

  /**
   * Build user prompt with contact and profile information
   */
  private buildUserPrompt(request: AIEmailGenerationRequest): string {
    const { contact, userProfile, customInstructions, targetRoles } = request;

    let prompt = `Generate a personalized email with the following information:

RECIPIENT INFORMATION:
- Name: ${contact.name}
- Email: ${contact.email}`;

    if (contact.company) prompt += `\n- Company: ${contact.company}`;
    if (contact.position) prompt += `\n- Position: ${contact.position}`;
    if (contact.linkedin_link) prompt += `\n- LinkedIn: ${contact.linkedin_link}`;

    prompt += `\n\nSENDER (USER) INFORMATION:`;
    if (userProfile.full_name) prompt += `\n- Name: ${userProfile.full_name}`;
    if (userProfile.title) prompt += `\n- Current Title: ${userProfile.title}`;
    if (userProfile.company) prompt += `\n- Current Company: ${userProfile.company}`;
    if (userProfile.location) prompt += `\n- Location: ${userProfile.location}`;
    if (userProfile.college) prompt += `\n- Education: ${userProfile.college}`;
    if (userProfile.experience_years) prompt += `\n- Years of Experience: ${userProfile.experience_years}`;
    if (userProfile.phone) prompt += `\n- Phone: ${userProfile.phone}`;
    if (userProfile.available_for_work !== undefined) {
      prompt += `\n- Available for Work: ${userProfile.available_for_work ? 'Yes' : 'No'}`;
    }
    if (userProfile.bio) prompt += `\n- Bio: ${userProfile.bio}`;
    
    if (userProfile.skills && userProfile.skills.length > 0) {
      const topSkills = userProfile.skills.slice(0, 4); // Limited to top 4 skills for brevity
      prompt += `\n- Key Skills: ${topSkills.join(', ')}`;
    }

    // Add concise work experience information
    if (userProfile.experiences && userProfile.experiences.length > 0) {
      prompt += `\n- Work Experience:`;
      // Limit to most recent 2 experiences for ultra-concise emails
      const recentExperiences = userProfile.experiences.slice(0, 2);
      
      recentExperiences.forEach((exp, index) => {
        prompt += `\n  ${index + 1}. ${exp.job_title} at ${exp.company}`;
        if (exp.start_date || exp.end_date) {
          const startDate = exp.start_date ? new Date(exp.start_date).getFullYear() : '';
          const endDate = exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).getFullYear() : '');
          if (startDate || endDate) prompt += ` (${startDate}-${endDate})`;
        }
        
        // Only include the most impressive achievement or skill for brevity
        if (exp.achievements && exp.achievements.length > 0) {
          prompt += `\n     Top Achievement: ${exp.achievements[0]}`;
        } else if (exp.skills_used && exp.skills_used.length > 0) {
          const topSkill = exp.skills_used[0];
          prompt += `\n     Key Skill: ${topSkill}`;
        }
      });
    }

    if (userProfile.linkedin) prompt += `\n- LinkedIn: ${userProfile.linkedin}`;
    if (userProfile.github) prompt += `\n- GitHub: ${userProfile.github}`;
    if (userProfile.website) prompt += `\n- Website: ${userProfile.website}`;

    if (targetRoles && targetRoles.length > 0) {
      prompt += `\n\nTARGET ROLES:\nThe sender is looking for opportunities in the following roles: ${targetRoles.join(', ')}`;
    }

    if (customInstructions) {
      prompt += `\n\nCUSTOM INSTRUCTIONS:\n${customInstructions}`;
    }

    prompt += `\n\nGenerate an ultra-concise, simple email that:
1. Uses ONLY the most relevant detail from sender's profile (pick 1-2 key points maximum)
2. Mentions recipient's name and company if available
3. States purpose in ONE simple sentence
4. Includes ONE clear call to action
5. Maximum 120 words total
6. Formats any URLs as clickable HTML links: <a href="URL">Text</a>

CRITICAL LINK FORMATTING:
- LinkedIn: Convert ${userProfile.linkedin || 'linkedin_url'} to <a href="${userProfile.linkedin || 'linkedin_url'}">LinkedIn Profile</a>
- GitHub: Convert ${userProfile.github || 'github_url'} to <a href="${userProfile.github || 'github_url'}">GitHub</a>
- Website: Convert ${userProfile.website || 'website_url'} to <a href="${userProfile.website || 'website_url'}">Portfolio</a>
- Any other URLs must be in <a href="URL">descriptive text</a> format

SIMPLICITY RULES:
- Use simple, everyday language
- Avoid industry jargon or buzzwords
- One idea per sentence
- Get to the point immediately
- Skip lengthy introductions or explanations

Remember: MAXIMUM 120 words. Every word must add value.`;

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

      // Ensure links are properly formatted
      const processedBody = this.ensureClickableLinks(parsed.body);

      // Validate brevity requirements
      const validation = this.validateEmailBrevity(parsed.subject, processedBody);
      
      let reasoning = parsed.reasoning || '';
      if (!validation.isValid) {
        console.warn('Email brevity validation failed:', validation.warnings);
        reasoning += (reasoning ? ' | ' : '') + `Warnings: ${validation.warnings.join(', ')}`;
      }

      return {
        subject: parsed.subject,
        body: processedBody,
        reasoning
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback: try to extract subject and body manually
      const lines = aiResponse.split('\n').filter(line => line.trim());
      const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
      const subject = subjectLine ? subjectLine.replace(/subject:/i, '').trim() : 'Quick Question';
      
      // Use the full response as body if parsing fails
      const body = aiResponse.includes('{') ? 
        'Hi ' + (aiResponse.includes('Hi') ? aiResponse.split('Hi')[1] : aiResponse) :
        aiResponse;

      return {
        subject,
        body: this.ensureClickableLinks(body.trim()),
        reasoning: 'AI response parsing failed, using fallback format'
      };
    }
  }

  /**
   * Ensure all URLs in the email body are properly formatted as clickable HTML links
   */
  private ensureClickableLinks(body: string): string {
    // First handle specific platform patterns before general URL conversion
    let processedBody = body;

    // Handle LinkedIn profiles (without https prefix)
    processedBody = processedBody.replace(
      /(?<!href=["'])(www\.)?linkedin\.com\/in\/[^\s<>"]+/gi,
      (match) => {
        const url = match.startsWith('www.') ? `https://${match}` : `https://${match}`;
        return `<a href="${url}">LinkedIn Profile</a>`;
      }
    );

    // Handle GitHub profiles (without https prefix)
    processedBody = processedBody.replace(
      /(?<!href=["'])(www\.)?github\.com\/[^\s<>"]+/gi,
      (match) => {
        const url = match.startsWith('www.') ? `https://${match}` : `https://${match}`;
        return `<a href="${url}">GitHub</a>`;
      }
    );

    // Convert remaining plain URLs to clickable links (only if not already in <a> tags)
    processedBody = processedBody.replace(
      /(?<!href=["']|>)(https?:\/\/[^\s<>"]+)(?![^<]*<\/a>)/gi,
      '<a href="$1">$1</a>'
    );

    // Handle www. URLs without protocol
    processedBody = processedBody.replace(
      /(?<!href=["']|>|https?:\/\/)(www\.[^\s<>"]+)(?![^<]*<\/a>)/gi,
      '<a href="https://$1">$1</a>'
    );

    // Ensure proper spacing around links
    processedBody = processedBody.replace(/(<\/a>)([^\s\n\.,!?])/g, '$1 $2');
    processedBody = processedBody.replace(/([^\s\n])(<a href)/g, '$1 $2');

    return processedBody;
  }

  /**
   * Legacy method for backward compatibility
   */
  async generateEmailContent(companyName: string, founderName: string): Promise<{ subject: string; body: string }> {
    const template = {
      subject: `Partnership with ${companyName}`,
      body: `Hi ${founderName},

I'm reaching out about a partnership between ${companyName} and <a href="https://hirebuddy.net">Hirebuddy</a>.

Hirebuddy helps 10,000+ professionals find jobs through our platform. We partner with companies to connect them with qualified talent quickly.

Would you be open to a 15-minute call this week to explore how we can help ${companyName} hire better?

Best regards,
Sarvagya Kulshreshtha
Co-Founder, <a href="https://hirebuddy.net">Hirebuddy</a>
Phone: +91 92893 93231`
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
  formatAsHtml(text: string): string {
    // Check if text already contains HTML tags
    if (/<[a-z][\s\S]*>/i.test(text)) {
      // Text already contains HTML, just format paragraphs
      return text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(?!<p>)/, '<p>')
        .replace(/(?<!<\/p>)$/, '</p>')
        .replace(/<p><\/p>/g, ''); // Remove empty paragraphs
    } else {
      // Plain text, convert to HTML
      return text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    }
  }

  /**
   * Get email body formatted for HTML display (for UI components)
   */
  getHtmlFormattedEmail(body: string): string {
    // Ensure links are clickable and add proper spacing
    const processedBody = this.ensureClickableLinks(body);
    return this.formatAsHtml(processedBody);
  }

  /**
   * Validate email meets brevity requirements
   */
  private validateEmailBrevity(subject: string, body: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Count words (excluding HTML tags)
    const bodyText = body.replace(/<[^>]*>/g, '').trim();
    const wordCount = bodyText.split(/\s+/).length;
    const subjectWords = subject.split(/\s+/).length;
    
    if (subjectWords > 6) {
      warnings.push(`Subject is too long (${subjectWords} words, max 6)`);
    }
    
    if (wordCount > 120) {
      warnings.push(`Email body is too long (${wordCount} words, max 120)`);
    }
    
    // Check for paragraph count
    const paragraphs = bodyText.split(/\n\n/).length;
    if (paragraphs > 3) {
      warnings.push(`Too many paragraphs (${paragraphs}, max 3)`);
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
}

export const emailService = new EmailService();
export default emailService; 