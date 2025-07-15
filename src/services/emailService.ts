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
  private openaiApiKey: string;

  constructor() {
    this.apiBaseUrl = 'https://a2wzu306xj.execute-api.us-east-1.amazonaws.com';
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  /**
   * Send an email using the AWS API
   */
  async sendEmail(request: EmailSendRequest): Promise<EmailSendResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different response types
      if (typeof data === 'string') {
        // Handle string responses like "Upgrade your plan. Email limit reached."
        throw new Error(data);
      }

      return data as EmailSendResponse;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send a follow-up email using the AWS API
   */
  async sendFollowUp(request: FollowUpRequest): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send_followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send follow-up: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending follow-up:', error);
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
      // Test with a minimal POST to send_email endpoint to see if it responds correctly
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

      if (response.status === 400 || response.status === 422) {
        // These status codes indicate the API is working but validation failed
        // which means the endpoint is reachable and responding correctly
        return {
          success: true,
          message: 'AWS Email API connection successful'
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
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }

    try {
      const systemPrompt = this.buildSystemPrompt(request.emailType, request.tone || 'professional');
      const userPrompt = this.buildUserPrompt(request);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
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

RESPONSE FORMAT:
You must respond in this exact JSON format:
{
  "subject": "Compelling subject line here",
  "body": "Email body here with proper line breaks using \\n\\n for paragraphs",
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

IMPORTANT: Select only the most relevant profile information that would be compelling to the recipient. Don't include every detail - focus on what would make the strongest impression for this specific email type and recipient. If target roles are provided, emphasize how the sender's background aligns with those specific roles.

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