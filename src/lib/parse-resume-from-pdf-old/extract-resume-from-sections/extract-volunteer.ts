import type { ResumeSectionToLines } from "../../../types/resume";
import { type FeatureSet } from "./lib/feature-scoring";

export interface ResumeVolunteer {
  organization: string;
  role: string;
  date: string;
  descriptions: string[];
}

export const extractVolunteer = (sections: ResumeSectionToLines): { volunteers: ResumeVolunteer[] } => {
  const volunteerLines = sections.volunteer || sections.volunteerexperience || sections.volunteerwork || sections.communityservice || [];
  
  if (volunteerLines.length === 0) {
    return { volunteers: [] };
  }
  
  const volunteers: ResumeVolunteer[] = [];
  let currentVolunteer: Partial<ResumeVolunteer> = {};
  let descriptions: string[] = [];
  
  // Feature sets for identifying different parts of volunteer experience
  const organizationFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Foundation|Charity|Organization|Society|Association|Non-profit|NGO|Community|Church|Hospital|School)\b/i.test(text),
      score: 10
    },
    {
      match: (text) => /^[A-Z][A-Za-z\s&.,'-]+$/.test(text.trim()) && text.length > 5 && text.length < 60,
      score: 5
    }
  ];
  
  const roleFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Volunteer|Coordinator|Leader|Assistant|Member|Tutor|Mentor|Helper|Organizer)\b/i.test(text),
      score: 10
    },
    {
      match: (text) => /^[A-Z][A-Za-z\s-]+$/.test(text.trim()) && text.length > 5 && text.length < 50,
      score: 5
    }
  ];
  
  const dateFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i.test(text),
      score: 10
    },
    {
      match: (text) => /\b\d{4}\s*[-–—]\s*\d{4}\b/.test(text),
      score: 9
    },
    {
      match: (text) => /\b\d{4}\s*[-–—]\s*(Present|Current|Now)\b/i.test(text),
      score: 9
    },
    {
      match: (text) => /\b\d{1,2}\/\d{4}\s*[-–—]\s*\d{1,2}\/\d{4}\b/.test(text),
      score: 8
    }
  ];
  
  for (let i = 0; i < volunteerLines.length; i++) {
    const line = volunteerLines[i];
    const text = line.text.trim();
    
    if (!text) continue;
    
    // Check if this line contains a date (likely start of new volunteer experience)
    const dateScore = dateFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    if (dateScore > 5) {
      // Save previous volunteer experience if it exists
      if (currentVolunteer.organization || currentVolunteer.role) {
        volunteers.push({
          organization: currentVolunteer.organization || "",
          role: currentVolunteer.role || "",
          date: currentVolunteer.date || "",
          descriptions: descriptions.filter(d => d.trim().length > 0)
        });
      }
      
      // Start new volunteer experience
      currentVolunteer = { date: text };
      descriptions = [];
    } else {
      // Try to identify organization, role, or description
      const organizationScore = organizationFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      const roleScore = roleFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      if (organizationScore > 5 && !currentVolunteer.organization) {
        currentVolunteer.organization = text;
      } else if (roleScore > 5 && !currentVolunteer.role) {
        currentVolunteer.role = text;
      } else if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
        // This is likely a bullet point description
        descriptions.push(text.replace(/^[•\-*]\s*/, ''));
      } else if (text.length > 20) {
        // This is likely a description
        descriptions.push(text);
      }
    }
  }
  
  // Don't forget the last volunteer experience
  if (currentVolunteer.organization || currentVolunteer.role) {
    volunteers.push({
      organization: currentVolunteer.organization || "",
      role: currentVolunteer.role || "",
      date: currentVolunteer.date || "",
      descriptions: descriptions.filter(d => d.trim().length > 0)
    });
  }
  
  return { volunteers };
}; 