interface CoverLetterRequest {
  resumeData: any;
  jobDescription: string;
  keyPoints: string[];
  companyName?: string;
  positionTitle?: string;
  userPreferences?: {
    tone?: 'professional' | 'enthusiastic' | 'conversational';
    length?: 'short' | 'medium' | 'long';
    focusAreas?: string[];
  };
}

interface CoverLetterResponse {
  coverLetter: string;
  suggestions: string[];
  keywordsUsed: string[];
}

class CoverLetterService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn('OpenAI API key not found in environment variables. Cover letter generation will not work.');
    }
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }

    try {
      console.log('Making OpenAI API request...');
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature,
          max_tokens: 2000, // Increased token limit
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, response.statusText, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
        } else if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('OpenAI API server error. Please try again later.');
        } else {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('OpenAI API response received successfully');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI API');
      }
      
      return data.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw error;
    }
  }

  private extractResumeText(resumeData: any): string {
    if (!resumeData) {
      return 'No resume data available.';
    }

    let resumeText = '';
    
    // Personal Info
    if (resumeData.personalInfo) {
      const { name, email, phone, location, linkedin, github } = resumeData.personalInfo;
      if (name) resumeText += `Name: ${name}\n`;
      if (email) resumeText += `Email: ${email}\n`;
      if (phone) resumeText += `Phone: ${phone}\n`;
      if (location) resumeText += `Location: ${location}\n`;
      if (linkedin) resumeText += `LinkedIn: ${linkedin}\n`;
      if (github) resumeText += `GitHub: ${github}\n`;
      if (resumeText) resumeText += '\n';
    }

    // Summary
    if (resumeData.summary && resumeData.summary.trim()) {
      resumeText += `PROFESSIONAL SUMMARY:\n${resumeData.summary.trim()}\n\n`;
    }

    // Experience
    if (resumeData.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
      resumeText += 'WORK EXPERIENCE:\n';
      resumeData.experience.forEach((exp: any) => {
        if (exp.jobTitle && exp.company) {
          resumeText += `${exp.jobTitle} at ${exp.company}`;
          if (exp.startDate) {
            resumeText += ` (${exp.startDate} - ${exp.current ? 'Present' : (exp.endDate || 'Present')})`;
          }
          resumeText += '\n';
          
          if (exp.location) resumeText += `Location: ${exp.location}\n`;
          if (exp.description && exp.description.trim()) {
            resumeText += `Description: ${exp.description.trim()}\n`;
          }
          
          if (exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0) {
            resumeText += 'Key Achievements:\n';
            exp.achievements.forEach((achievement: string) => {
              if (achievement && achievement.trim()) {
                resumeText += `• ${achievement.trim()}\n`;
              }
            });
          }
          resumeText += '\n';
        }
      });
    }

    // Education
    if (resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
      resumeText += 'EDUCATION:\n';
      resumeData.education.forEach((edu: any) => {
        if (edu.degree && edu.school) {
          resumeText += `${edu.degree} from ${edu.school}`;
          if (edu.startDate && edu.endDate) {
            resumeText += ` (${edu.startDate} - ${edu.endDate})`;
          }
          resumeText += '\n';
          
          if (edu.gpa) resumeText += `GPA: ${edu.gpa}\n`;
          if (edu.honors && edu.honors.trim()) resumeText += `Honors: ${edu.honors.trim()}\n`;
          if (edu.coursework && Array.isArray(edu.coursework) && edu.coursework.length > 0) {
            resumeText += `Relevant Coursework: ${edu.coursework.join(', ')}\n`;
          }
          resumeText += '\n';
        }
      });
    }

    // Skills
    if (resumeData.skills) {
      const skillSections = [];
      if (resumeData.skills.technical && Array.isArray(resumeData.skills.technical) && resumeData.skills.technical.length > 0) {
        skillSections.push(`Technical Skills: ${resumeData.skills.technical.join(', ')}`);
      }
      if (resumeData.skills.soft && Array.isArray(resumeData.skills.soft) && resumeData.skills.soft.length > 0) {
        skillSections.push(`Soft Skills: ${resumeData.skills.soft.join(', ')}`);
      }
      if (resumeData.skills.frameworks && Array.isArray(resumeData.skills.frameworks) && resumeData.skills.frameworks.length > 0) {
        skillSections.push(`Frameworks & Tools: ${resumeData.skills.frameworks.join(', ')}`);
      }
      if (resumeData.skills.languages && Array.isArray(resumeData.skills.languages) && resumeData.skills.languages.length > 0) {
        skillSections.push(`Programming Languages: ${resumeData.skills.languages.join(', ')}`);
      }
      
      if (skillSections.length > 0) {
        resumeText += 'SKILLS:\n';
        skillSections.forEach(section => {
          resumeText += `${section}\n`;
        });
        resumeText += '\n';
      }
    }

    // Projects
    if (resumeData.projects && Array.isArray(resumeData.projects) && resumeData.projects.length > 0) {
      resumeText += 'PROJECTS:\n';
      resumeData.projects.forEach((project: any) => {
        if (project.name) {
          resumeText += `${project.name}`;
          if (project.description && project.description.trim()) {
            resumeText += `: ${project.description.trim()}`;
          }
          resumeText += '\n';
          
          if (project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0) {
            resumeText += `Technologies: ${project.technologies.join(', ')}\n`;
          }
          if (project.link) resumeText += `Link: ${project.link}\n`;
          if (project.github) resumeText += `GitHub: ${project.github}\n`;
          resumeText += '\n';
        }
      });
    }

    // Certifications
    if (resumeData.certifications && Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0) {
      resumeText += 'CERTIFICATIONS:\n';
      resumeData.certifications.forEach((cert: any) => {
        if (cert.name) {
          resumeText += `${cert.name}`;
          if (cert.issuer) resumeText += ` - ${cert.issuer}`;
          if (cert.date) resumeText += ` (${cert.date})`;
          resumeText += '\n';
        }
      });
      resumeText += '\n';
    }

    return resumeText.trim() || 'Resume data is incomplete. Please ensure your resume has basic information filled out.';
  }

  async generateCoverLetter(request: CoverLetterRequest): Promise<CoverLetterResponse> {
    const resumeText = this.extractResumeText(request.resumeData);
    const { tone = 'professional', length = 'medium' } = request.userPreferences || {};
    
    const lengthGuidance = {
      short: '2-3 paragraphs, concise and to the point (250-350 words)',
      medium: '3-4 paragraphs, balanced detail (350-500 words)',
      long: '4-5 paragraphs, comprehensive and detailed (500-700 words)'
    };

    const toneGuidance = {
      professional: 'formal, business-appropriate language with a confident tone',
      enthusiastic: 'energetic and passionate while maintaining professionalism',
      conversational: 'friendly and approachable while remaining professional'
    };

    // Validate inputs
    if (!request.jobDescription || request.jobDescription.trim().length < 50) {
      throw new Error('Job description is too short. Please provide a more detailed job description.');
    }

    const validKeyPoints = request.keyPoints.filter(point => point.trim());
    // If no key points provided, use a default one
    const keyPointsToUse = validKeyPoints.length > 0 ? validKeyPoints : ['Highlight relevant experience and skills that match the job requirements'];

    const prompt = `You are an expert cover letter writer with 10+ years of experience helping job seekers land interviews at top companies. Create a compelling, personalized cover letter that will make the candidate stand out.

CANDIDATE'S RESUME DATA:
${resumeText}

JOB DESCRIPTION:
${request.jobDescription.trim()}

${request.companyName ? `COMPANY NAME: ${request.companyName}` : ''}
${request.positionTitle ? `POSITION TITLE: ${request.positionTitle}` : ''}

KEY POINTS TO EMPHASIZE:
${keyPointsToUse.map(point => `• ${point.trim()}`).join('\n')}

REQUIREMENTS:
- Length: ${lengthGuidance[length]}
- Tone: ${toneGuidance[tone]}
- Use specific examples from the resume that directly match job requirements
- Incorporate relevant keywords from the job description naturally (don't force them)
- Show genuine enthusiasm for the company and role
- Highlight quantifiable achievements when possible
- Address the hiring manager's potential concerns
- End with a confident call to action
- Make it ATS-friendly
- Ensure the letter flows naturally and tells a compelling story

STRUCTURE:
1. Opening paragraph: Strong hook + position interest + brief value proposition
2. Body paragraph(s): Relevant experience + specific achievements + job requirement matches + key points
3. Closing paragraph: Company interest + next steps + professional call to action

IMPORTANT: 
- Do NOT use generic phrases like "I am writing to express my interest"
- Do NOT repeat information verbatim from the resume
- DO connect resume experiences to job requirements
- DO show personality while remaining professional
- DO research-backed enthusiasm for the company/role

Please provide your response in this exact JSON format (ensure valid JSON):
{
  "coverLetter": "The complete cover letter text here...",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"],
  "keywordsUsed": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

    const messages = [
      { 
        role: 'system', 
        content: 'You are an expert cover letter writer with extensive experience in creating compelling, personalized cover letters that get results. You understand ATS optimization, modern hiring practices, and what hiring managers look for. Always respond with valid JSON format.' 
      },
      { role: 'user', content: prompt }
    ];

    const response = await this.makeRequest(messages, 0.8);
    
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim();
      let jsonResponse = cleanedResponse;
      
      // Remove any markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        jsonResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        jsonResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsed = JSON.parse(jsonResponse);
      
      // Validate the response structure
      if (!parsed.coverLetter || typeof parsed.coverLetter !== 'string') {
        throw new Error('Invalid cover letter content in response');
      }
      
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        parsed.suggestions = ['Consider adding more specific examples', 'Tailor the letter further to the company culture', 'Add more quantifiable achievements'];
      }
      
      if (!parsed.keywordsUsed || !Array.isArray(parsed.keywordsUsed)) {
        parsed.keywordsUsed = [];
      }
      
      return parsed as CoverLetterResponse;
    } catch (error) {
      console.error('Failed to parse cover letter response:', error);
      console.error('Raw response:', response);
      
      // Fallback: try to extract just the cover letter text
      if (response && response.trim()) {
        return {
          coverLetter: response.trim(),
          suggestions: ['Review the generated content for accuracy', 'Consider customizing further for the specific role', 'Add more company-specific details'],
          keywordsUsed: []
        };
      }
      
      throw new Error('Failed to generate cover letter. Please try again with a more detailed job description.');
    }
  }

  async improveCoverLetter(
    currentCoverLetter: string,
    improvementRequest: string,
    resumeData: any,
    jobDescription: string
  ): Promise<string> {
    if (!currentCoverLetter || !currentCoverLetter.trim()) {
      throw new Error('No cover letter provided for improvement');
    }

    if (!improvementRequest || improvementRequest.trim().length < 10) {
      throw new Error('Please provide a more detailed improvement request (at least 10 characters)');
    }

    const resumeText = this.extractResumeText(resumeData);

    const prompt = `You are an expert cover letter editor with extensive experience in refining cover letters. Please improve the following cover letter based on the specific request while maintaining its professional quality and structure.

CURRENT COVER LETTER:
${currentCoverLetter.trim()}

IMPROVEMENT REQUEST:
${improvementRequest.trim()}

RESUME DATA (for reference):
${resumeText}

JOB DESCRIPTION (for reference):
${jobDescription.trim()}

INSTRUCTIONS:
- Address the specific improvement request while maintaining the overall quality
- Keep the same general structure and length unless specifically requested to change
- Ensure the improved version flows naturally
- Maintain professional tone unless specifically asked to change it
- Keep all factual information accurate
- Do not add false information or experiences
- Ensure the letter remains ATS-friendly

Please provide ONLY the improved cover letter text (no JSON, no explanations, just the cover letter):`;

    const messages = [
      { 
        role: 'system', 
        content: 'You are an expert cover letter editor who specializes in refining and improving cover letters based on specific feedback. Always provide only the improved cover letter text without any additional formatting or explanations.' 
      },
      { role: 'user', content: prompt }
    ];

    const response = await this.makeRequest(messages, 0.7);
    
    if (!response || response.trim().length < 100) {
      throw new Error('Failed to generate improved cover letter. Please try again with a different improvement request.');
    }

    return response.trim();
  }
}

export const coverLetterService = new CoverLetterService();
export type { CoverLetterRequest, CoverLetterResponse }; 
