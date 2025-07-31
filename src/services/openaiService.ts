import { supabase } from '@/lib/supabase';
import { EnvironmentValidator, SecureErrorHandler } from '../utils/security';
import { getConfig } from '@/config/environment';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ContentSuggestion {
  bulletPoints: string[];
  skills: string[];
  achievements: string[];
}

interface SkillGapAnalysis {
  missingSkills: string[];
  recommendedCertifications: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  overallScore: number;
}

interface JobMatchingResult {
  matchingScore: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestedChanges: {
    summary: string;
    experienceUpdates: Array<{
      experienceId: string;
      suggestedDescription: string;
      suggestedAchievements: string[];
    }>;
    skillsToAdd: string[];
    skillsToEmphasize: string[];
  };
}

class OpenAIService {
  private baseUrl: string;

  constructor() {
    // Use Supabase Edge Function instead of direct OpenAI API
    this.baseUrl = `${getConfig().supabase.url}/functions/v1/openai-proxy`;
  }

  private async makeSecureRequest(messages: ChatMessage[], options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required for AI features');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': getConfig().supabase.anonKey
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4o-mini',
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || '';

    } catch (error) {
      console.error('Secure OpenAI request failed:', error);
      throw SecureErrorHandler.createSafeError(
        error,
        'AI service is temporarily unavailable. Please try again later.'
      );
    }
  }

  async generateContentSuggestions(
    jobTitle: string,
    industry: string,
    experienceLevel: string,
    currentDescription?: string
  ): Promise<ContentSuggestion> {
    const prompt = `
As a professional resume writer, generate content suggestions for a ${experienceLevel} ${jobTitle} in the ${industry} industry.

${currentDescription ? `Current description: "${currentDescription}"` : ''}

Please provide:
1. 5-7 impactful bullet points for work experience
2. 8-10 relevant technical and soft skills
3. 3-5 quantifiable achievements

Focus on:
- Action verbs and quantifiable results
- Industry-specific keywords
- ATS-friendly language
- Modern professional terminology

Return the response in this exact JSON format:
{
  "bulletPoints": ["bullet point 1", "bullet point 2", ...],
  "skills": ["skill 1", "skill 2", ...],
  "achievements": ["achievement 1", "achievement 2", ...]
}
`;

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert resume writer and career coach.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.makeSecureRequest(messages);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse content suggestions response:', error);
      throw new Error('Invalid response format from AI service');
    }
  }

  async analyzeSkillGap(
    resumeData: any,
    targetJobTitle: string,
    targetIndustry: string
  ): Promise<SkillGapAnalysis> {
    const resumeText = this.extractResumeText(resumeData);
    
    const prompt = `
Analyze this resume for a ${targetJobTitle} position in the ${targetIndustry} industry:

RESUME DATA:
${resumeText}

TARGET ROLE: ${targetJobTitle} in ${targetIndustry}

Provide a comprehensive skill gap analysis including:
1. Missing skills that are crucial for the target role
2. Recommended certifications to pursue
3. Current strength areas to highlight
4. Areas needing improvement
5. Overall readiness score (0-100)

Return the response in this exact JSON format:
{
  "missingSkills": ["skill 1", "skill 2", ...],
  "recommendedCertifications": ["cert 1", "cert 2", ...],
  "strengthAreas": ["strength 1", "strength 2", ...],
  "improvementAreas": ["area 1", "area 2", ...],
  "overallScore": 85
}
`;

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert career counselor and technical recruiter.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.makeSecureRequest(messages);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse skill gap analysis response:', error);
      throw new Error('Invalid response format from AI service');
    }
  }

  async matchJobDescription(
    resumeData: any,
    jobDescription: string
  ): Promise<JobMatchingResult> {
    const resumeText = this.extractResumeText(resumeData);
    
    const prompt = `
You are an expert ATS optimization specialist and resume writer. Analyze how well this resume matches the job description and provide comprehensive tailoring suggestions.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please provide a detailed analysis including:

1. MATCHING SCORE (0-100): Calculate based on:
   - Skills alignment (40%)
   - Experience relevance (30%)
   - Keyword presence (20%)
   - Education/qualifications match (10%)

2. KEYWORD ANALYSIS:
   - Keywords that already match between resume and job description
   - Important keywords missing from resume (focus on technical skills, tools, methodologies, certifications)

3. OPTIMIZATION SUGGESTIONS:
   - Updated professional summary that incorporates job-specific keywords and requirements
   - Specific improvements for each experience entry with job-relevant language
   - Skills to add (technical and soft skills mentioned in job description)
   - Skills to emphasize (existing skills that match job requirements)

Focus on:
- ATS-friendly keywords and phrases
- Quantifiable achievements and metrics
- Industry-specific terminology
- Action verbs that match the job requirements
- Technical skills and tools mentioned in the job posting
- Soft skills and competencies required
- Certifications and qualifications needed

Return the response in this exact JSON format (ensure valid JSON):
{
  "matchingScore": 75,
  "keywordMatches": ["React", "JavaScript", "Team Leadership", "Agile", "Problem Solving"],
  "missingKeywords": ["TypeScript", "AWS", "Docker", "CI/CD", "Scrum Master"],
  "suggestedChanges": {
    "summary": "Results-driven Software Engineer with 5+ years of experience in React, JavaScript, and team leadership. Proven track record of delivering scalable web applications using Agile methodologies. Expertise in problem-solving and cross-functional collaboration, with strong background in modern development practices and cloud technologies.",
    "experienceUpdates": [
      {
        "experienceId": "exp-1",
        "suggestedDescription": "Led development of responsive web applications using React and JavaScript, collaborating with cross-functional teams in Agile environment. Implemented CI/CD pipelines and deployed applications to AWS cloud infrastructure.",
        "suggestedAchievements": [
          "Increased application performance by 40% through code optimization and implementation of best practices",
          "Mentored 3 junior developers and conducted code reviews to ensure quality standards",
          "Successfully delivered 15+ projects on time using Scrum methodology"
        ]
      }
    ],
    "skillsToAdd": ["TypeScript", "AWS", "Docker", "CI/CD", "Scrum"],
    "skillsToEmphasize": ["React", "JavaScript", "Team Leadership", "Agile"]
  }
}

Important: Ensure the response is valid JSON. Do not include any text before or after the JSON object.
`;

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert ATS optimization specialist and resume writer. Always respond with valid JSON only.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.makeSecureRequest(messages, { temperature: 0.3 }); // Lower temperature for more consistent formatting
    
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
      
      const result = JSON.parse(jsonString);
      
      // Validate the result structure
      if (!result.matchingScore || !result.keywordMatches || !result.missingKeywords || !result.suggestedChanges) {
        throw new Error('Invalid response structure from AI service');
      }
      
      // Ensure arrays exist
      result.keywordMatches = result.keywordMatches || [];
      result.missingKeywords = result.missingKeywords || [];
      result.suggestedChanges.skillsToAdd = result.suggestedChanges.skillsToAdd || [];
      result.suggestedChanges.skillsToEmphasize = result.suggestedChanges.skillsToEmphasize || [];
      result.suggestedChanges.experienceUpdates = result.suggestedChanges.experienceUpdates || [];
      
      // Ensure matching score is within valid range
      result.matchingScore = Math.max(0, Math.min(100, result.matchingScore));
      
      return result;
    } catch (error) {
      console.error('Failed to parse job matching response:', error);
      console.error('Raw response:', response);
      
      // Return a fallback response with basic analysis
      return {
        matchingScore: 50,
        keywordMatches: [],
        missingKeywords: ['Please try again - AI analysis failed'],
        suggestedChanges: {
          summary: 'Unable to generate optimized summary. Please try the analysis again.',
          experienceUpdates: [],
          skillsToAdd: [],
          skillsToEmphasize: []
        }
      };
    }
  }

  async analyzeSkillsMarket(
    userSkills: string[],
    jobTitle?: string,
    industry?: string,
    experienceLevel?: string
  ): Promise<{
    skillsAnalysis: Array<{
      skill: string;
      userHas: boolean;
      demandLevel: 'high' | 'medium' | 'low';
      marketTrend: 'rising' | 'stable' | 'declining';
      jobMatches: number;
      category: 'technical' | 'soft' | 'tool' | 'language' | 'certification';
      priority: number;
      salaryImpact: string;
      description: string;
    }>;
    marketInsights: {
      overallScore: number;
      marketAlignment: number;
      recommendations: string[];
      emergingSkills: string[];
      industryTrends: string[];
    };
  }> {
    const contextInfo = jobTitle && industry ? 
      `Target Role: ${jobTitle} in ${industry} industry (${experienceLevel || 'Mid-level'})` : 
      'General market analysis';

    const prompt = `
You are an expert career analyst and market researcher with access to current job market data. Analyze the provided skills and generate comprehensive market insights.

USER SKILLS: ${userSkills.join(', ') || 'None provided'}
CONTEXT: ${contextInfo}

Please provide a detailed analysis including:

1. SKILLS ANALYSIS: For each of the top 25-30 most relevant skills in the current market (including the user's skills), provide:
   - Skill name
   - Whether user has it (true/false)
   - Demand level (high/medium/low) based on current job market
   - Market trend (rising/stable/declining)
   - Estimated job matches (realistic numbers)
   - Category (technical/soft/tool/language/certification)
   - Priority score (0-100)
   - Salary impact (e.g., "+15% average salary", "Standard market rate")
   - Brief description of why it's important

2. MARKET INSIGHTS:
   - Overall skills score (0-100)
   - Market alignment percentage
   - Top 5 specific recommendations for improvement
   - 3-5 emerging skills to watch
   - Current industry trends

Focus on:
- Current high-demand skills (AI/ML, Cloud, DevOps, Data Science, Cybersecurity)
- Emerging technologies (GenAI, Edge Computing, Quantum, Web3)
- Essential soft skills (Leadership, Communication, Problem-solving)
- Industry-specific tools and certifications
- Remote work and collaboration skills
- Include diverse skill types across all categories

Return response in this exact JSON format:
{
  "skillsAnalysis": [
    {
      "skill": "React",
      "userHas": true,
      "demandLevel": "high",
      "marketTrend": "rising",
      "jobMatches": 1250,
      "category": "technical",
      "priority": 95,
      "salaryImpact": "+12% average salary",
      "description": "Essential frontend framework with high market demand"
    }
  ],
  "marketInsights": {
    "overallScore": 75,
    "marketAlignment": 68,
    "recommendations": ["Learn TypeScript", "Get AWS certification"],
    "emergingSkills": ["Next.js", "Generative AI"],
    "industryTrends": ["Remote-first development", "AI integration"]
  }
}
`;

    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: 'You are an expert career analyst and market researcher with deep knowledge of current job market trends, salary data, and skill demands across industries.' 
      },
      { role: 'user', content: prompt }
    ];

    const response = await this.makeSecureRequest(messages, { temperature: 0.3 });
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse skills market analysis response:', error);
      throw new Error('Invalid response format from AI service');
    }
  }

  async generateAdditionalSkillRecommendations(
    userSkills: string[],
    excludedSkills: string[],
    existingSkills: string[],
    jobTitle?: string,
    industry?: string,
    experienceLevel?: string,
    count: number = 15
  ): Promise<Array<{
    skill: string;
    userHas: boolean;
    demandLevel: 'high' | 'medium' | 'low';
    marketTrend: 'rising' | 'stable' | 'declining';
    jobMatches: number;
    category: 'technical' | 'soft' | 'tool' | 'language' | 'certification';
    priority: number;
    salaryImpact: string;
    description: string;
  }>> {
    const contextInfo = jobTitle && industry ? 
      `Target Role: ${jobTitle} in ${industry} industry (${experienceLevel || 'Mid-level'})` : 
      'General market analysis';

    const prompt = `
You are an expert career analyst. Generate ${count} new skill recommendations that are different from previously suggested skills.

USER SKILLS: ${userSkills.join(', ') || 'None provided'}
EXCLUDED SKILLS: ${excludedSkills.join(', ') || 'None'}
EXISTING RECOMMENDATIONS: ${existingSkills.join(', ') || 'None'}
CONTEXT: ${contextInfo}

Generate ${count} NEW skill recommendations that:
1. Are NOT in the excluded or existing recommendations lists
2. Are relevant to the user's context and career goals
3. Include a mix of technical skills, tools, certifications, and soft skills
4. Focus on high-demand and emerging skills
5. Are diverse across different categories

For each skill, provide:
- Skill name (must be unique and different from excluded/existing)
- Whether user has it (false, since these are recommendations)
- Demand level (high/medium/low)
- Market trend (rising/stable/declining)
- Estimated job matches
- Category (technical/soft/tool/language/certification)
- Priority score (0-100)
- Salary impact
- Brief description

Focus on fresh, relevant skills like:
- Emerging AI/ML technologies (GPT integration, LangChain, Vector Databases)
- Modern cloud technologies (Serverless, Edge Computing)
- DevOps and automation tools
- Cybersecurity skills
- Data analysis and visualization
- Project management and leadership
- Industry-specific certifications
- Communication and collaboration tools

Return ONLY a JSON array of skills:
[
  {
    "skill": "LangChain",
    "userHas": false,
    "demandLevel": "high",
    "marketTrend": "rising",
    "jobMatches": 890,
    "category": "technical",
    "priority": 88,
    "salaryImpact": "+18% average salary",
    "description": "Framework for building AI applications with LLMs"
  }
]
`;

    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: 'You are an expert career analyst. Generate diverse, unique skill recommendations that help users stay competitive in the job market.' 
      },
      { role: 'user', content: prompt }
    ];

    const response = await this.makeSecureRequest(messages, { temperature: 0.4 });
    
    try {
      const skills = JSON.parse(response);
      // Ensure we return an array
      return Array.isArray(skills) ? skills : [];
    } catch (error) {
      console.error('Failed to parse additional skill recommendations response:', error);
      return [];
    }
  }

  private extractResumeText(resumeData: any): string {
    const sections = [];
    
    // Personal Info
    if (resumeData.personalInfo) {
      sections.push(`Name: ${resumeData.personalInfo.name}`);
      sections.push(`Email: ${resumeData.personalInfo.email}`);
      sections.push(`Location: ${resumeData.personalInfo.location}`);
    }
    
    // Summary
    if (resumeData.summary) {
      sections.push(`\nSUMMARY:\n${resumeData.summary}`);
    }
    
    // Experience
    if (resumeData.experience?.length > 0) {
      sections.push('\nEXPERIENCE:');
      resumeData.experience.forEach((exp: any, index: number) => {
        sections.push(`${index + 1}. ${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`);
        if (exp.description) sections.push(`   Description: ${exp.description}`);
        if (exp.achievements?.length > 0) {
          sections.push(`   Achievements: ${exp.achievements.join('; ')}`);
        }
      });
    }
    
    // Education
    if (resumeData.education?.length > 0) {
      sections.push('\nEDUCATION:');
      resumeData.education.forEach((edu: any) => {
        sections.push(`${edu.degree} from ${edu.school} (${edu.startDate} - ${edu.endDate})`);
      });
    }
    
    // Skills
    if (resumeData.skills) {
      const allSkills = [
        ...(resumeData.skills.technical || []),
        ...(resumeData.skills.soft || []),
        ...(resumeData.skills.languages || []),
        ...(resumeData.skills.frameworks || [])
      ];
      if (allSkills.length > 0) {
        sections.push(`\nSKILLS: ${allSkills.join(', ')}`);
      }
    }
    
    // Projects
    if (resumeData.projects?.length > 0) {
      sections.push('\nPROJECTS:');
      resumeData.projects.forEach((project: any) => {
        sections.push(`${project.name}: ${project.description}`);
        if (project.technologies?.length > 0) {
          sections.push(`   Technologies: ${project.technologies.join(', ')}`);
        }
      });
    }
    
    // Certifications
    if (resumeData.certifications?.length > 0) {
      sections.push('\nCERTIFICATIONS:');
      resumeData.certifications.forEach((cert: any) => {
        sections.push(`${cert.name} - ${cert.issuer} (${cert.date})`);
      });
    }
    
    // Languages
    if (resumeData.languages?.length > 0) {
      sections.push('\nLANGUAGES:');
      resumeData.languages.forEach((lang: any) => {
        sections.push(`${lang.language} (${lang.proficiency})`);
      });
    }
    
    // Volunteer Experience
    if (resumeData.volunteer?.length > 0) {
      sections.push('\nVOLUNTEER EXPERIENCE:');
      resumeData.volunteer.forEach((vol: any) => {
        sections.push(`${vol.role} at ${vol.organization} (${vol.startDate} - ${vol.endDate})`);
        if (vol.description) sections.push(`   Description: ${vol.description}`);
      });
    }
    
    // Awards
    if (resumeData.awards?.length > 0) {
      sections.push('\nAWARDS AND HONORS:');
      resumeData.awards.forEach((award: any) => {
        sections.push(`${award.title} - ${award.issuer} (${award.date})`);
        if (award.description) sections.push(`   Description: ${award.description}`);
      });
    }
    
    return sections.join('\n');
  }
}

export const openaiService = new OpenAIService();
export type { ContentSuggestion, SkillGapAnalysis, JobMatchingResult }; 