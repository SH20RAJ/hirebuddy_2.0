import { EnvironmentValidator, SecureErrorHandler, InputValidator, InputSanitizer } from '../utils/security';
import { supabase } from '@/lib/supabase';

export interface EmailSendRequest {
  sender: string;
  to: string;
  subject: string;
  body: string;
  attachment_path?: string;
  isHtml?: boolean;
  content_type?: string;
  mime_type?: string;
}

export interface FollowUpRequest {
  sender: string;
  body: string;
  to: string;
  subject?: string;
  isHtml?: boolean;
  content_type?: string;
  mime_type?: string;
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
  private useHtmlEmails: boolean = true; // Enable HTML emails for proper formatting and line spacing

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
      if (request.isHtml && !InputValidator.isSafeHtmlEmail(request.body)) {
        throw new Error('Unsafe HTML content in email body');
      } else if (!request.isHtml && !InputValidator.isSafeText(request.body)) {
        throw new Error('Invalid characters in email body');
      }



      // Sanitize inputs
      const sanitizedRequest = {
        ...request,
        to: InputSanitizer.sanitizeEmail(request.to),
        sender: InputSanitizer.sanitizeEmail(request.sender),
        subject: InputSanitizer.sanitizeText(request.subject),
        body: request.isHtml ? InputSanitizer.sanitizeHtmlEmail(request.body) : InputSanitizer.sanitizeText(request.body)
      };

      console.log('🚀 Sending email via AWS API...', { 
        to: sanitizedRequest.to, 
        subject: sanitizedRequest.subject,
        sender: sanitizedRequest.sender,
        isHtml: sanitizedRequest.isHtml,
        content_type: sanitizedRequest.content_type,
        mime_type: sanitizedRequest.mime_type,
        bodyPreview: sanitizedRequest.body.substring(0, 200) + '...'
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
      // Input validation and sanitization for follow-up emails
      if (!InputValidator.isValidEmail(request.to)) {
        throw new Error('Invalid recipient email address');
      }
      if (!InputValidator.isValidEmail(request.sender)) {
        throw new Error('Invalid sender email address');
      }
      if (request.isHtml && !InputValidator.isSafeHtmlEmail(request.body)) {
        throw new Error('Unsafe HTML content in follow-up email body');
      } else if (!request.isHtml && !InputValidator.isSafeText(request.body)) {
        throw new Error('Invalid characters in follow-up email body');
      }

      // Sanitize inputs
      const sanitizedRequest = {
        ...request,
        to: InputSanitizer.sanitizeEmail(request.to),
        sender: InputSanitizer.sanitizeEmail(request.sender),
        body: request.isHtml ? InputSanitizer.sanitizeHtmlEmail(request.body) : InputSanitizer.sanitizeText(request.body)
      };

      console.log('🚀 Sending follow-up email via AWS API...', { 
        to: sanitizedRequest.to, 
        sender: sanitizedRequest.sender,
        isHtml: sanitizedRequest.isHtml,
        content_type: sanitizedRequest.content_type,
        mime_type: sanitizedRequest.mime_type,
        bodyPreview: sanitizedRequest.body.substring(0, 200) + '...'
      });

      const response = await fetch(`${this.apiBaseUrl}/send_followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedRequest),
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
    const basePrompt = `You are a professional email writing assistant specializing in creating personalized, effective emails for job seekers and professionals. Your emails should be:

1. PERSONALIZED - Use specific details about the recipient and sender
2. CONCISE - Keep it brief and to the point (150-250 words max)
3. PROFESSIONAL - Maintain appropriate business tone
4. ACTION-ORIENTED - Include a clear call to action
5. AUTHENTIC - Sound genuine and human, not robotic

TONE: ${tone}
EMAIL TYPE: ${emailType}

IMPORTANT GUIDELINES:
- Only include relevant information from the user's profile - don't overwhelm with unnecessary details
- Use the recipient's name and company naturally
- Avoid generic templates - make each email feel personal
- Include specific value propositions relevant to the recipient
- Keep subject lines compelling but professional (6-8 words max)
- End with a clear, specific call to action

EMAIL FORMATTING REQUIREMENTS:
- Use \\n\\n to separate paragraphs (this creates proper spacing)
- Use \\n for line breaks within the same thought/paragraph
- Start with a proper greeting (e.g., "Hi [Name]," or "Dear [Name],")
- Include proper spacing before closing (\\n\\nBest regards,\\n[Your Name])
- Structure should be: Greeting → Opening → Body → Call to Action → Closing
- Ensure each paragraph serves a specific purpose and flows naturally

RESPONSE FORMAT:
You must respond in this exact JSON format:
{
  "subject": "Compelling subject line here",
  "body": "Email body here with proper line breaks using \\n\\n for paragraphs and \\n for line breaks within paragraphs",
  "reasoning": "Brief explanation of personalization choices"
}`;

    const typeSpecificGuidelines = {
      'cold_outreach': 'Focus on building rapport and offering value. Mention specific achievements or skills that would interest the recipient.',
      'follow_up': 'Reference previous communication politely. Show continued interest and provide additional value.',
      'job_application': 'Highlight relevant experience and skills that match the role. Show enthusiasm for the specific position.',
      'networking': 'Focus on mutual connections, shared interests, or industry insights. Keep it conversational.',
      'partnership': 'Emphasize mutual benefits and specific collaboration opportunities.'
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
      const topSkills = userProfile.skills.slice(0, 8); // Increased to top 8 skills for better context
      prompt += `\n- Key Skills: ${topSkills.join(', ')}`;
    }

    // Add detailed work experience information
    if (userProfile.experiences && userProfile.experiences.length > 0) {
      prompt += `\n- Work Experience:`;
      // Limit to most recent 3 experiences to avoid overwhelming the prompt
      const recentExperiences = userProfile.experiences.slice(0, 3);
      
      recentExperiences.forEach((exp, index) => {
        prompt += `\n  ${index + 1}. ${exp.job_title} at ${exp.company}`;
        if (exp.location) prompt += ` (${exp.location})`;
        if (exp.start_date || exp.end_date) {
          const startDate = exp.start_date ? new Date(exp.start_date).getFullYear() : 'Unknown';
          const endDate = exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).getFullYear() : 'Unknown');
          prompt += ` | ${startDate} - ${endDate}`;
        }
        
        if (exp.description) {
          // Limit description to first 100 characters to keep prompt manageable
          const shortDescription = exp.description.length > 100 
            ? exp.description.substring(0, 100) + '...' 
            : exp.description;
          prompt += `\n     Description: ${shortDescription}`;
        }
        
        if (exp.achievements && exp.achievements.length > 0) {
          // Include top 2 achievements
          const topAchievements = exp.achievements.slice(0, 2);
          prompt += `\n     Key Achievements: ${topAchievements.join('; ')}`;
        }
        
        if (exp.skills_used && exp.skills_used.length > 0) {
          // Include relevant skills from this role
          const roleSkills = exp.skills_used.slice(0, 5);
          prompt += `\n     Skills Used: ${roleSkills.join(', ')}`;
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

    prompt += `\n\nPlease generate a personalized email that:
1. Uses the most relevant and impressive information from the sender's profile and experience
2. References specific details about the recipient when possible
3. Highlights relevant achievements, skills, and experience that would interest the recipient
4. Sounds natural and conversational, not like a template
5. Includes a clear value proposition based on the sender's background
6. Ends with a specific call to action
7. Keeps the overall length concise (150-250 words) while being impactful
8. If target roles are specified, tailor the email content to emphasize skills and experience relevant to those roles

IMPORTANT FORMATTING INSTRUCTIONS:
- Start with "Hi [Name]," or "Dear [Name]," (use the recipient's actual name)
- Use \\n\\n to separate each paragraph for proper spacing
- Structure the email as: Greeting → Opening → Body → Call to Action → Closing
- End with proper closing like "\\n\\nBest regards,\\n[Your actual name]"
- Ensure each paragraph is concise and serves a specific purpose
- Don't use excessive formatting - keep it clean and professional

CONTENT GUIDELINES:
- Select only the most relevant profile information that would be compelling to the recipient
- Don't include every detail - focus on what would make the strongest impression for this specific email type and recipient
- If target roles are provided, emphasize how the sender's background aligns with those specific roles
- Make sure the email flows naturally from introduction to value proposition to call to action

Remember to respond in the exact JSON format specified in the system prompt.`;

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
   * Format email body as plain text with proper structure and spacing for email clients
   */
  formatAsPlainText(plainText: string): string {
    if (!plainText || typeof plainText !== 'string') {
      return 'No content provided';
    }

    // Clean the input text
    let cleanText = plainText.trim();
    
    // Handle different line break patterns that AI might use
    cleanText = cleanText
      // Normalize various line break patterns
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Handle multiple consecutive line breaks (more than 2)
      .replace(/\n{3,}/g, '\n\n')
      // Clean up any trailing whitespace on lines
      .replace(/[ \t]+$/gm, '');

    // Split into paragraphs and ensure proper spacing
    const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    // Join paragraphs with double line breaks for proper email formatting
    return paragraphs.join('\n\n');
  }

  /**
   * Format email body as HTML with proper structure and spacing
   */
  formatAsHtml(plainText: string): string {
    if (!plainText || typeof plainText !== 'string') {
      return '<p>No content provided</p>';
    }

    // Clean the input text
    let cleanText = plainText.trim();
    
    // Handle different line break patterns that AI might use
    cleanText = cleanText
      // Normalize various line break patterns
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Handle multiple consecutive line breaks (more than 2)
      .replace(/\n{3,}/g, '\n\n')
      // Clean up any trailing whitespace on lines
      .replace(/[ \t]+$/gm, '');

    // Split into paragraphs based on double line breaks
    const paragraphs = cleanText.split(/\n\n+/);
    
    // Process each paragraph
    const formattedParagraphs = paragraphs
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => {
        // Handle single line breaks within paragraphs as soft breaks
        const formattedParagraph = paragraph
          .trim()
          .replace(/\n/g, '<br>')
          // Handle common email elements
          .replace(/^(Best regards|Best,|Sincerely,|Thanks,|Thank you,|Regards,)/i, '<br><br>$1')
          // Handle signature separators
          .replace(/^--$/gm, '<br>--<br>')
          // Handle bullet points or numbered lists
          .replace(/^[\s]*[-*•]\s+/gm, '&nbsp;&nbsp;• ')
          .replace(/^[\s]*(\d+\.)\s+/gm, '&nbsp;&nbsp;$1 ')
          // Handle email addresses and URLs (make them clickable)
          .replace(/(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi, '<a href="$1" style="color: #0066cc; text-decoration: underline;">$1</a>')
          .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, '<a href="mailto:$1" style="color: #0066cc; text-decoration: underline;">$1</a>');

        return `<p style="margin: 0 0 16px 0; line-height: 1.5;">${formattedParagraph}</p>`;
      });

    // Wrap in a container with proper email styling
    const emailBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333333; max-width: 600px; margin: 0; padding: 0;">
        ${formattedParagraphs.join('')}
      </div>
    `.trim();

    return emailBody;
  }

  /**
   * Generate a preview of how the email will look when formatted as HTML
   */
  previewEmailHtml(plainText: string): string {
    const formattedHtml = this.formatAsHtml(plainText);
    
    // Add additional styling for preview purposes
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          .email-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 0;
            margin: 0 auto;
            max-width: 600px;
          }
          .email-header {
            background-color: #f8f9fa;
            padding: 16px 24px;
            border-bottom: 1px solid #e9ecef;
            border-radius: 8px 8px 0 0;
            font-weight: 600;
            color: #495057;
          }
          .email-body {
            padding: 24px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">Email Preview</div>
          <div class="email-body">
            ${formattedHtml}
          </div>
        </div>
      </body>
      </html>
    `.trim();
  }

  /**
   * Get properly formatted email content for sending
   * Uses plain text formatting for better compatibility until HTML backend support is confirmed
   */
  getFormattedEmailContent(plainTextBody: string, useHtml: boolean = this.useHtmlEmails): string {
    return useHtml ? this.formatAsHtml(plainTextBody) : this.formatAsPlainText(plainTextBody);
  }

  /**
   * Check if HTML emails are enabled
   */
  isHtmlEmailsEnabled(): boolean {
    return this.useHtmlEmails;
  }

  /**
   * Enable or disable HTML emails (for when backend support is ready)
   */
  setHtmlEmailsEnabled(enabled: boolean): void {
    this.useHtmlEmails = enabled;
  }
}

export const emailService = new EmailService();
export default emailService; 