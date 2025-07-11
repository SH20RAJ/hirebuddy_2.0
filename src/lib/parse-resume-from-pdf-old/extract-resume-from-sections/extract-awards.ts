import type { ResumeSectionToLines } from "../../../types/resume";
import { type FeatureSet } from "./lib/feature-scoring";

export interface ResumeAward {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export const extractAwards = (sections: ResumeSectionToLines): { awards: ResumeAward[] } => {
  const awardLines = sections.awards || sections.achievements || sections.honors || sections.honorsandawards || [];
  
  if (awardLines.length === 0) {
    return { awards: [] };
  }
  
  const awards: ResumeAward[] = [];
  let currentAward: Partial<ResumeAward> = {};
  let descriptions: string[] = [];
  
  // Feature sets for identifying different parts of awards
  const awardTitleFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Award|Prize|Recognition|Honor|Achievement|Certificate|Medal|Scholarship|Fellowship)\b/i.test(text),
      score: 10
    },
    {
      match: (text) => /^[A-Z][A-Za-z\s\-']+$/.test(text.trim()) && text.length > 5 && text.length < 80,
      score: 5
    },
    {
      match: (text) => /\b(Dean's List|Magna Cum Laude|Summa Cum Laude|Cum Laude|Phi Beta Kappa|Outstanding|Excellence)\b/i.test(text),
      score: 8
    }
  ];
  
  const issuerFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(University|College|Institute|Organization|Company|Association|Society|Foundation)\b/i.test(text),
      score: 8
    },
    {
      match: (text) => /^[A-Z][A-Za-z\s&.,'-]+$/.test(text.trim()) && text.length > 3 && text.length < 60,
      score: 5
    }
  ];
  
  const dateFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i.test(text),
      score: 10
    },
    {
      match: (text) => /\b\d{4}\b/.test(text),
      score: 8
    },
    {
      match: (text) => /\b\d{1,2}\/\d{4}\b/.test(text),
      score: 7
    }
  ];
  
  for (let i = 0; i < awardLines.length; i++) {
    const line = awardLines[i];
    const text = line.text.trim();
    
    if (!text) continue;
    
    // Check if this line contains an award title (likely start of new award)
    const titleScore = awardTitleFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    if (titleScore > 7) {
      // Save previous award if it exists
      if (currentAward.title) {
        awards.push({
          title: currentAward.title || "",
          issuer: currentAward.issuer || "",
          date: currentAward.date || "",
          description: descriptions.join(' ').trim()
        });
      }
      
      // Start new award
      currentAward = { title: text };
      descriptions = [];
    } else {
      // Try to identify issuer, date, or description
      const issuerScore = issuerFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      const dateScore = dateFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      if (issuerScore > 5 && !currentAward.issuer) {
        currentAward.issuer = text;
      } else if (dateScore > 7 && !currentAward.date) {
        currentAward.date = text;
      } else if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
        // This is likely a bullet point description
        descriptions.push(text.replace(/^[•\-*]\s*/, ''));
      } else if (text.length > 10 && !currentAward.title) {
        // This might be an award title if we haven't found one yet
        currentAward.title = text;
      } else if (text.length > 5) {
        // This is likely a description
        descriptions.push(text);
      }
    }
  }
  
  // Don't forget the last award
  if (currentAward.title) {
    awards.push({
      title: currentAward.title || "",
      issuer: currentAward.issuer || "",
      date: currentAward.date || "",
      description: descriptions.join(' ').trim()
    });
  }
  
  return { awards };
}; 