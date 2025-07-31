import type { ResumeWorkExperience, ResumeSectionToLines } from "../../../types/resume";
import { extractWithFeatureScoring, type FeatureSet } from "./lib/feature-scoring";

export const extractWorkExperience = (sections: ResumeSectionToLines): { workExperiences: ResumeWorkExperience[] } => {
  const experienceLines = sections.experience || sections.workexperience || sections.professionalexperience || sections.employment || sections.employmenthistory || sections.workhistory || sections.career || [];
  
  if (experienceLines.length === 0) {
    return { workExperiences: [] };
  }
  
  const workExperiences: ResumeWorkExperience[] = [];
  let currentExperience: Partial<ResumeWorkExperience> = {};
  let descriptions: string[] = [];
  
  // Feature sets for identifying different parts of work experience
  const companyFeatureSets: FeatureSet[] = [
    {
      match: (text) => /^[A-Z][A-Za-z\s&.,'-]+$/.test(text.trim()) && text.length > 2 && text.length < 50,
      score: 5
    },
    {
      match: (text) => /\b(Inc|LLC|Corp|Company|Ltd|Limited|Corporation|Group|Solutions|Technologies|Systems|Services|Consulting|Partners)\b/i.test(text),
      score: 8
    },
    {
      match: (text) => /\b(Google|Microsoft|Apple|Amazon|Meta|Facebook|Netflix|Tesla|Uber|Airbnb|Spotify|Adobe|Oracle|IBM|Intel|Cisco|HP|Dell|Samsung|Sony|Nike|Coca-Cola|McDonald's|Walmart|Target|Bank|Hospital|University|School)\b/i.test(text),
      score: 10
    }
  ];
  
  const jobTitleFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Principal|Staff|Vice President|VP|CEO|CTO|CFO|COO|President)\b/i.test(text),
      score: 8
    },
    {
      match: (text) => /\b(Software|Data|Product|Project|Marketing|Sales|Finance|Operations|Human Resources|HR|Customer|Business|Technical|Quality|Research|Design|UX|UI)\b/i.test(text),
      score: 6
    },
    {
      match: (text) => /^[A-Z][A-Za-z\s-]+$/.test(text.trim()) && text.length > 5 && text.length < 40,
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
    },
    {
      match: (text) => /\b\d{1,2}\/\d{2,4}\s*[-–—]\s*(Present|Current|Now)\b/i.test(text),
      score: 8
    }
  ];
  
  for (let i = 0; i < experienceLines.length; i++) {
    const line = experienceLines[i];
    const text = line.text.trim();
    
    if (!text) continue;
    
    // Check if this line contains a date (likely start of new experience)
    const dateScore = dateFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    // Check for company and job title scores
    const companyScore = companyFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    const jobTitleScore = jobTitleFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    // Determine if this is the start of a new experience entry
    const isNewExperience = dateScore > 5 || 
      (companyScore > 7 && !currentExperience.company) || 
      (jobTitleScore > 7 && !currentExperience.jobTitle && !currentExperience.company);
    
    if (isNewExperience && (currentExperience.company || currentExperience.jobTitle)) {
      // Save previous experience if it exists
      workExperiences.push({
        company: currentExperience.company || "",
        jobTitle: currentExperience.jobTitle || "",
        date: currentExperience.date || "",
        descriptions: descriptions.filter(d => d.trim().length > 0)
      });
      
      // Start new experience
      currentExperience = {};
      descriptions = [];
    }
    
    // Assign the current line to the appropriate field
    if (dateScore > 5 && !currentExperience.date) {
      currentExperience.date = text;
    } else if (companyScore > 5 && !currentExperience.company) {
      currentExperience.company = text;
    } else if (jobTitleScore > 5 && !currentExperience.jobTitle) {
      currentExperience.jobTitle = text;
    } else if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
      // This is likely a bullet point description
      descriptions.push(text.replace(/^[•\-*]\s*/, ''));
    } else if (text.length > 20 && !text.match(/^\d/) && !text.match(/^[A-Z]{2,}$/)) {
      // This is likely a description (not a date or abbreviation)
      descriptions.push(text);
    } else if (!currentExperience.company && !currentExperience.jobTitle && text.length > 5) {
      // If we haven't identified company or job title yet, this might be one of them
      if (companyScore >= jobTitleScore) {
        currentExperience.company = text;
      } else {
        currentExperience.jobTitle = text;
      }
    }
  }
  
  // Don't forget the last experience
  if (currentExperience.company || currentExperience.jobTitle) {
    workExperiences.push({
      company: currentExperience.company || "",
      jobTitle: currentExperience.jobTitle || "",
      date: currentExperience.date || "",
      descriptions: descriptions.filter(d => d.trim().length > 0)
    });
  }
  
  return { workExperiences };
}; 