import type { Resume } from "../types/resume";

// Convert parsed resume data to resume builder format
export const convertParsedResumeToBuilderFormat = (parsedResume: Resume) => {
  return {
    name: parsedResume.profile.name || "",
    email: parsedResume.profile.email || "",
    phone: parsedResume.profile.phone || "",
    location: parsedResume.profile.location || "",
    website: parsedResume.profile.url || "",
    linkedin: extractLinkedInFromUrl(parsedResume.profile.url) || "",
    github: extractGitHubFromUrl(parsedResume.profile.url) || "",
    summary: parsedResume.profile.summary || "",
    experience: parsedResume.workExperiences.map(exp => ({
      company: exp.company,
      position: exp.jobTitle,
      startDate: extractStartDate(exp.date),
      endDate: extractEndDate(exp.date),
      description: exp.descriptions.join('\n'),
      current: exp.date.toLowerCase().includes('present') || exp.date.toLowerCase().includes('current')
    })),
    education: parsedResume.educations.map(edu => ({
      school: edu.school,
      degree: edu.degree,
      field: extractFieldFromDegree(edu.degree),
      startDate: extractStartDate(edu.date),
      endDate: extractEndDate(edu.date),
      gpa: edu.gpa,
      description: edu.descriptions.join('\n')
    })),
    skills: parsedResume.skills.descriptions || []
  };
};

// Convert parsed resume data to enhanced resume builder format
export const convertParsedResumeToEnhancedFormat = (parsedResume: Resume) => {
  return {
    personalInfo: {
      name: parsedResume.profile.name || "",
      email: parsedResume.profile.email || "",
      phone: parsedResume.profile.phone || "",
      location: parsedResume.profile.location || "",
      website: parsedResume.profile.url || "",
      linkedin: parsedResume.profile.linkedin || extractLinkedInFromUrl(parsedResume.profile.url) || "",
      github: parsedResume.profile.github || extractGitHubFromUrl(parsedResume.profile.url) || "",
    },
    summary: parsedResume.profile.summary || "",
    experience: (parsedResume.workExperiences || []).map((exp, index) => ({
      id: `exp-${index}`,
      jobTitle: exp.jobTitle || "",
      company: exp.company || "",
      location: "", // Not typically extracted from PDF
      startDate: extractStartDate(exp.date),
      endDate: extractEndDate(exp.date),
      current: exp.date.toLowerCase().includes('present') || exp.date.toLowerCase().includes('current'),
      description: exp.jobDescription || (exp.descriptions || []).join('\n'),
      achievements: exp.achievements || exp.descriptions || []
    })),
    education: (parsedResume.educations || []).map((edu, index) => ({
      id: `edu-${index}`,
      degree: edu.degree || "",
      school: edu.school || "",
      location: "", // Not typically extracted from PDF
      startDate: extractStartDate(edu.date),
      endDate: extractEndDate(edu.date),
      gpa: edu.gpa || "",
      honors: (edu.honors || []).join(', '), // Convert array to string for compatibility
      coursework: edu.coursework || edu.descriptions || []
    })),
    skills: {
      technical: [
        ...(parsedResume.skills.programmingLanguages || []),
        ...(parsedResume.skills.technicalSkills || []),
        ...(parsedResume.skills.tools || [])
      ],
      soft: parsedResume.skills.softSkills || [],
      languages: [], // Will be handled separately if language section exists
      frameworks: parsedResume.skills.frameworks || []
    },
    projects: (parsedResume.projects || []).map((proj, index) => ({
      id: `proj-${index}`,
      name: proj.project || "",
      description: (proj.descriptions || []).join('\n'),
      technologies: [], // Not typically extracted from PDF
      link: "",
      github: "",
      startDate: extractStartDate(proj.date),
      endDate: extractEndDate(proj.date)
    })),
    certifications: (parsedResume.certifications || []).map((cert, index) => ({
      id: `cert-${index}`,
      name: cert.name || "",
      issuer: cert.issuer || "",
      date: cert.date || "",
      expiryDate: cert.expiryDate || "",
      credentialId: cert.credentialId || "",
      link: ""
    })),
    languages: (parsedResume.languages || []).map((lang, index) => ({
      id: `lang-${index}`,
      language: lang.language || "",
      proficiency: lang.proficiency || "Intermediate"
    })),
    volunteer: (parsedResume.volunteers || []).map((vol, index) => ({
      id: `vol-${index}`,
      organization: vol.organization || "",
      role: vol.role || "",
      startDate: extractStartDate(vol.date),
      endDate: extractEndDate(vol.date),
      description: (vol.descriptions || []).join('\n')
    })),
    awards: (parsedResume.awards || []).map((award, index) => ({
      id: `award-${index}`,
      title: award.title || "",
      issuer: award.issuer || "",
      date: award.date || "",
      description: award.description || ""
    }))
  };
};

// Helper functions to extract specific information
const extractLinkedInFromUrl = (url: string): string => {
  if (!url) return "";
  const linkedinMatch = url.match(/linkedin\.com\/in\/([^\/\s]+)/i);
  return linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : "";
};

const extractGitHubFromUrl = (url: string): string => {
  if (!url) return "";
  const githubMatch = url.match(/github\.com\/([^\/\s]+)/i);
  return githubMatch ? `github.com/${githubMatch[1]}` : "";
};

const extractStartDate = (dateString: string): string => {
  if (!dateString) return "";
  
  // Handle various date formats
  const datePatterns = [
    /(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|\w+)/i, // "Jan 2020 - Dec 2022"
    /(\d{4})\s*[-–—]\s*(\d{4}|\w+)/i, // "2020 - 2022"
    /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|\w+)/i // "01/2020 - 12/2022"
  ];
  
  for (const pattern of datePatterns) {
    const match = dateString.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return dateString.split(/[-–—]/)[0]?.trim() || "";
};

const extractEndDate = (dateString: string): string => {
  if (!dateString) return "";
  
  if (dateString.toLowerCase().includes('present') || 
      dateString.toLowerCase().includes('current') ||
      dateString.toLowerCase().includes('now')) {
    return "Present";
  }
  
  // Handle various date formats
  const datePatterns = [
    /(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4})/i, // "Jan 2020 - Dec 2022"
    /(\d{4})\s*[-–—]\s*(\d{4})/i, // "2020 - 2022"
    /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4})/i // "01/2020 - 12/2022"
  ];
  
  for (const pattern of datePatterns) {
    const match = dateString.match(pattern);
    if (match) {
      return match[2];
    }
  }
  
  const parts = dateString.split(/[-–—]/);
  return parts.length > 1 ? parts[1].trim() : "";
};

const extractFieldFromDegree = (degree: string): string => {
  if (!degree) return "";
  
  // Common field patterns
  const fieldPatterns = [
    /in\s+([^,\n]+)/i,
    /of\s+([^,\n]+)/i,
    /(Computer Science|Engineering|Business|Mathematics|Physics|Chemistry|Biology|Psychology|Economics|Marketing|Finance)/i
  ];
  
  for (const pattern of fieldPatterns) {
    const match = degree.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return "";
}; 