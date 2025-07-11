import type { ResumeProject, ResumeSectionToLines } from "../../../types/resume";
import { type FeatureSet } from "./lib/feature-scoring";

export const extractProject = (sections: ResumeSectionToLines): { projects: ResumeProject[] } => {
  const projectLines = sections.projects || sections.personalprojects || sections.keyprojects || [];
  
  if (projectLines.length === 0) {
    return { projects: [] };
  }
  
  const projects: ResumeProject[] = [];
  let currentProject: Partial<ResumeProject> = {};
  let descriptions: string[] = [];
  
  // Feature sets for identifying different parts of projects
  const projectNameFeatureSets: FeatureSet[] = [
    {
      match: (text) => /^[A-Z][A-Za-z\s\-_0-9]+$/.test(text.trim()) && text.length > 3 && text.length < 50,
      score: 5
    },
    {
      match: (text) => /\b(App|Application|Website|System|Platform|Tool|API|Dashboard)\b/i.test(text),
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
  
  for (let i = 0; i < projectLines.length; i++) {
    const line = projectLines[i];
    const text = line.text.trim();
    
    if (!text) continue;
    
    // Check if this line contains a project name (likely start of new project)
    const projectNameScore = projectNameFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    const dateScore = dateFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    if (projectNameScore > 5 && dateScore < 6) {
      // Save previous project if it exists
      if (currentProject.project) {
        projects.push({
          project: currentProject.project || "",
          date: currentProject.date || "",
          descriptions: descriptions.filter(d => d.trim().length > 0)
        });
      }
      
      // Start new project
      currentProject = { project: text };
      descriptions = [];
    } else if (dateScore > 6 && !currentProject.date) {
      currentProject.date = text;
    } else if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
      // This is likely a bullet point description
      descriptions.push(text.replace(/^[•\-*]\s*/, ''));
    } else if (text.length > 15) {
      // This is likely a description
      descriptions.push(text);
    }
  }
  
  // Don't forget the last project
  if (currentProject.project) {
    projects.push({
      project: currentProject.project || "",
      date: currentProject.date || "",
      descriptions: descriptions.filter(d => d.trim().length > 0)
    });
  }
  
  return { projects };
}; 