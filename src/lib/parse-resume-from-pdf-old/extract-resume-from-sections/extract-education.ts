import type { ResumeEducation, ResumeSectionToLines } from "../../../types/resume";
import { type FeatureSet } from "./lib/feature-scoring";

export const extractEducation = (sections: ResumeSectionToLines): { educations: ResumeEducation[] } => {
  const educationLines = sections.education || sections.academicbackground || sections.qualifications || [];
  
  if (educationLines.length === 0) {
    return { educations: [] };
  }
  
  const educations: ResumeEducation[] = [];
  let currentEducation: Partial<ResumeEducation> = {};
  let descriptions: string[] = [];
  
  // Feature sets for identifying different parts of education
  const schoolFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(University|College|Institute|School|Academy)\b/i.test(text),
      score: 10
    },
    {
      match: (text) => /^[A-Z][A-Za-z\s&.,'-]+$/.test(text.trim()) && text.length > 5 && text.length < 60,
      score: 5
    }
  ];
  
  const degreeFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Bachelor|Master|PhD|Doctorate|Associate|Certificate|Diploma)\b/i.test(text),
      score: 10
    },
    {
      match: (text) => /\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Ph\.?D\.?)\b/i.test(text),
      score: 9
    },
    {
      match: (text) => /\b(Computer Science|Engineering|Business|Mathematics|Physics|Chemistry|Biology)\b/i.test(text),
      score: 7
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
      match: (text) => /\b\d{4}\b/.test(text),
      score: 6
    }
  ];
  
  const gpaFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\bGPA:?\s*\d+\.?\d*\s*\/?\s*\d*\.?\d*\b/i.test(text),
      score: 10
    },
    {
      match: (text) => /\b\d+\.?\d*\s*\/\s*\d+\.?\d*\b/.test(text) && parseFloat(text.match(/\d+\.?\d*/)?.[0] || '0') <= 4.0,
      score: 8
    }
  ];
  
  for (let i = 0; i < educationLines.length; i++) {
    const line = educationLines[i];
    const text = line.text.trim();
    
    if (!text) continue;
    
    // Check if this line contains a school name (likely start of new education)
    const schoolScore = schoolFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    if (schoolScore > 8) {
      // Save previous education if it exists
      if (currentEducation.school || currentEducation.degree) {
        educations.push({
          school: currentEducation.school || "",
          degree: currentEducation.degree || "",
          date: currentEducation.date || "",
          gpa: currentEducation.gpa || "",
          descriptions: descriptions.filter(d => d.trim().length > 0)
        });
      }
      
      // Start new education
      currentEducation = { school: text };
      descriptions = [];
    } else {
      // Try to identify degree, date, GPA, or description
      const degreeScore = degreeFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      const dateScore = dateFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      const gpaScore = gpaFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      if (degreeScore > 7 && !currentEducation.degree) {
        currentEducation.degree = text;
      } else if (dateScore > 6 && !currentEducation.date) {
        currentEducation.date = text;
      } else if (gpaScore > 8 && !currentEducation.gpa) {
        currentEducation.gpa = text;
      } else if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
        // This is likely a bullet point description
        descriptions.push(text.replace(/^[•\-*]\s*/, ''));
      } else if (text.length > 15) {
        // This is likely a description
        descriptions.push(text);
      }
    }
  }
  
  // Don't forget the last education
  if (currentEducation.school || currentEducation.degree) {
    educations.push({
      school: currentEducation.school || "",
      degree: currentEducation.degree || "",
      date: currentEducation.date || "",
      gpa: currentEducation.gpa || "",
      descriptions: descriptions.filter(d => d.trim().length > 0)
    });
  }
  
  return { educations };
}; 