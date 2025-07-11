import { openaiService } from './openaiService';
import type { Resume } from '../types/resume';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface OpenAIResumeParseResponse {
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    url: string;
    linkedin: string;
    github: string;
    summary: string;
  };
  workExperiences: Array<{
    company: string;
    jobTitle: string;
    date: string;
    jobDescription: string;
    achievements: string[];
  }>;
  educations: Array<{
    school: string;
    degree: string;
    date: string;
    gpa: string;
    coursework: string[];
    honors: string[];
    activities: string[];
  }>;
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
    technicalSkills: string[];
    softSkills: string[];
    tools: string[];
  };
  projects: Array<{
    project: string;
    date: string;
    descriptions: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate: string;
    credentialId: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  volunteers: Array<{
    organization: string;
    role: string;
    date: string;
    descriptions: string[];
  }>;
  awards: Array<{
    title: string;
    issuer: string;
    date: string;
    description: string;
  }>;
}

class OpenAIResumeParser {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
  }

  /**
   * Extract text content from PDF file
   */
  private async extractTextFromPdf(fileUrl: string): Promise<string> {
    try {
      const pdfFile = await pdfjs.getDocument(fileUrl).promise;
      let fullText = '';

      for (let i = 1; i <= pdfFile.numPages; i++) {
        const page = await pdfFile.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items and join them
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF. Please ensure the PDF is readable.');
    }
  }

  /**
   * Parse resume text using OpenAI
   */
  private async parseResumeWithAI(resumeText: string): Promise<OpenAIResumeParseResponse> {
    const prompt = `
You are an expert resume parser. Extract and structure the following resume text into a comprehensive JSON format.

RESUME TEXT:
${resumeText}

Please extract ALL available information and structure it into the following JSON format. If a section is not present or information is not available, use empty arrays or empty strings as appropriate:

{
  "profile": {
    "name": "Full name of the person",
    "email": "Email address",
    "phone": "Phone number",
    "location": "City, State or full address",
    "url": "Primary website/portfolio URL (extract the main one, not LinkedIn/GitHub)",
    "linkedin": "LinkedIn profile URL or username (separate from main URL)",
    "github": "GitHub profile URL or username (separate from main URL)",
    "summary": "Professional summary or objective statement"
  },
  "workExperiences": [
    {
      "company": "Company name",
      "jobTitle": "Job title/position",
      "date": "Employment dates (e.g., 'Jan 2020 - Present' or '2020-2022')",
      "jobDescription": "Brief overview of the role and main responsibilities (2-3 sentences max)",
      "achievements": ["Specific achievement with quantifiable results", "Another measurable accomplishment", "Key contribution or impact"]
    }
  ],
  "educations": [
    {
      "school": "Institution name",
      "degree": "Degree type and field of study",
      "date": "Graduation date or date range",
      "gpa": "GPA if mentioned",
      "coursework": ["Relevant coursework item 1", "Relevant coursework item 2"],
      "honors": ["Academic honors", "Dean's List", "Magna Cum Laude"],
      "activities": ["Student organizations", "Academic projects", "Leadership roles"]
    }
  ],
  "skills": {
    "programmingLanguages": ["JavaScript", "Python", "Java", "C++", "TypeScript", "Go", "Rust", "Swift", "Kotlin"],
    "frameworks": ["React", "Angular", "Vue", "Node.js", "Express", "Django", "Spring", "Laravel", "Flutter"],
    "technicalSkills": ["AWS", "Docker", "Kubernetes", "Git", "SQL", "MongoDB", "Redis", "GraphQL", "REST APIs"],
    "softSkills": ["Leadership", "Communication", "Problem Solving", "Team Collaboration", "Project Management"],
    "tools": ["VS Code", "IntelliJ", "Figma", "Photoshop", "Jira", "Slack", "Trello"]
  },
  "projects": [
    {
      "project": "Project name",
      "date": "Project date or date range",
      "descriptions": ["Project description", "Technologies used", "Key achievements"]
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Date obtained",
      "expiryDate": "Expiry date if mentioned",
      "credentialId": "Credential ID if mentioned"
    }
  ],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Proficiency level (e.g., Native, Fluent, Intermediate, Basic)"
    }
  ],
  "volunteers": [
    {
      "organization": "Organization name",
      "role": "Volunteer role/position",
      "date": "Date range of volunteer work",
      "descriptions": ["Description of volunteer work", "Achievements"]
    }
  ],
  "awards": [
    {
      "title": "Award or honor title",
      "issuer": "Issuing organization",
      "date": "Date received",
      "description": "Description of the award"
    }
  ]
}

CRITICAL PARSING INSTRUCTIONS:

1. CONTACT INFORMATION:
   - Extract email, phone, and location from header/contact section
   - For URLs: Separate LinkedIn, GitHub, and main website/portfolio URLs
   - LinkedIn: Look for linkedin.com/in/ patterns
   - GitHub: Look for github.com/ patterns  
   - Main URL: Portfolio, personal website, or other professional URLs

2. WORK EXPERIENCE - SEPARATE JOB DESCRIPTION FROM ACHIEVEMENTS:
   - jobDescription: Brief role overview and main responsibilities (avoid bullet points)
   - achievements: Specific accomplishments with numbers, metrics, or measurable impact
   - DO NOT duplicate content between jobDescription and achievements
   - achievements should be quantifiable results, not general responsibilities

3. EDUCATION - CATEGORIZE DESCRIPTIONS PROPERLY:
   - coursework: Only actual course names or academic subjects
   - honors: Academic achievements like "Dean's List", "Magna Cum Laude", "Summa Cum Laude"
   - activities: Student organizations, clubs, leadership roles, academic projects
   - DO NOT put everything in one array - categorize appropriately

4. SKILLS - INTELLIGENT CATEGORIZATION:
   - programmingLanguages: Only actual programming languages
   - frameworks: Libraries, frameworks, and development platforms
   - technicalSkills: Tools, databases, cloud services, methodologies
   - softSkills: Interpersonal and management skills
   - tools: Software applications and development tools
   - DO NOT put all skills in one category

5. GENERAL RULES:
   - Extract ALL information present in the resume
   - Break down long paragraphs into individual bullet points
   - Standardize date formats but keep original meaning
   - Make reasonable inferences based on context
   - Ensure JSON is valid and properly formatted
   - Do not add information not present in the resume

Return ONLY the JSON object, no additional text or explanation.
`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert resume parser. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1, // Low temperature for consistent parsing
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || '';
      
      // Clean and parse the JSON response
      const cleanedResponse = aiResponse.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing resume with AI:', error);
      throw new Error('Failed to parse resume with AI. Please try again.');
    }
  }

  /**
   * Convert OpenAI response to Resume type
   */
  private convertToResumeType(aiResponse: OpenAIResumeParseResponse): Resume {
    return {
      profile: {
        name: aiResponse.profile.name || '',
        email: aiResponse.profile.email || '',
        phone: aiResponse.profile.phone || '',
        url: aiResponse.profile.url || '',
        linkedin: aiResponse.profile.linkedin || '',
        github: aiResponse.profile.github || '',
        summary: aiResponse.profile.summary || '',
        location: aiResponse.profile.location || ''
      },
      workExperiences: aiResponse.workExperiences.map(exp => ({
        company: exp.company || '',
        jobTitle: exp.jobTitle || '',
        date: exp.date || '',
        jobDescription: exp.jobDescription || '',
        achievements: exp.achievements || [],
        descriptions: exp.achievements || [] // Backward compatibility
      })),
      educations: aiResponse.educations.map(edu => ({
        school: edu.school || '',
        degree: edu.degree || '',
        date: edu.date || '',
        gpa: edu.gpa || '',
        coursework: edu.coursework || [],
        honors: edu.honors || [],
        activities: edu.activities || [],
        descriptions: [...(edu.coursework || []), ...(edu.honors || []), ...(edu.activities || [])] // Backward compatibility
      })),
      projects: aiResponse.projects.map(proj => ({
        project: proj.project || '',
        date: proj.date || '',
        descriptions: proj.descriptions || []
      })),
      skills: {
        programmingLanguages: aiResponse.skills.programmingLanguages || [],
        frameworks: aiResponse.skills.frameworks || [],
        technicalSkills: aiResponse.skills.technicalSkills || [],
        softSkills: aiResponse.skills.softSkills || [],
        tools: aiResponse.skills.tools || [],
        featuredSkills: [], // Backward compatibility
        descriptions: [
          ...(aiResponse.skills.programmingLanguages || []),
          ...(aiResponse.skills.frameworks || []),
          ...(aiResponse.skills.technicalSkills || []),
          ...(aiResponse.skills.softSkills || []),
          ...(aiResponse.skills.tools || [])
        ] // Backward compatibility
      },
      awards: aiResponse.awards.map(award => ({
        title: award.title || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || ''
      })),
      volunteers: aiResponse.volunteers.map(vol => ({
        organization: vol.organization || '',
        role: vol.role || '',
        date: vol.date || '',
        descriptions: vol.descriptions || []
      })),
      certifications: aiResponse.certifications.map(cert => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        expiryDate: cert.expiryDate || '',
        credentialId: cert.credentialId || ''
      })),
      languages: aiResponse.languages.map(lang => ({
        language: lang.language || '',
        proficiency: lang.proficiency || ''
      })),
      custom: {
        descriptions: []
      }
    };
  }

  /**
   * Main method to parse resume from PDF using OpenAI
   */
  async parseResumeFromPdf(fileUrl: string): Promise<Resume> {
    try {
      console.log('Starting OpenAI-based resume parsing...');
      
      // Step 1: Extract text from PDF
      console.log('Extracting text from PDF...');
      const resumeText = await this.extractTextFromPdf(fileUrl);
      
      if (!resumeText.trim()) {
        throw new Error('No text could be extracted from the PDF. Please ensure the PDF contains readable text.');
      }

      console.log('Extracted text length:', resumeText.length);
      
      // Step 2: Parse with OpenAI
      console.log('Parsing resume with OpenAI...');
      const aiResponse = await this.parseResumeWithAI(resumeText);
      
      // Step 3: Convert to Resume type
      console.log('Converting to Resume format...');
      const resume = this.convertToResumeType(aiResponse);
      
      console.log('Resume parsing completed successfully!');
      return resume;
      
    } catch (error) {
      console.error('Error in OpenAI resume parsing:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const openaiResumeParser = new OpenAIResumeParser();

// Export the main parsing function for backward compatibility
export const parseResumeFromPdf = (fileUrl: string): Promise<Resume> => {
  return openaiResumeParser.parseResumeFromPdf(fileUrl);
}; 