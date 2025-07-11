import type { ResumeSkills, ResumeSectionToLines } from "../../../types/resume";

export const extractSkills = (sections: ResumeSectionToLines): { skills: ResumeSkills } => {
  const skillsLines = sections.skills || sections.technicalskills || sections.corecompetencies || [];
  
  if (skillsLines.length === 0) {
    return { 
      skills: { 
        featuredSkills: [], 
        descriptions: [] 
      } 
    };
  }
  
  const descriptions: string[] = [];
  
  // Extract all skills text
  for (const line of skillsLines) {
    const text = line.text.trim();
    if (!text) continue;
    
    // Split by common delimiters
    const skillItems = text.split(/[,;|•\-\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    descriptions.push(...skillItems);
  }
  
  // Remove duplicates and clean up
  const uniqueDescriptions = [...new Set(descriptions)]
    .filter(desc => desc.length > 1 && desc.length < 50)
    .slice(0, 20); // Limit to 20 skills
  
  const skills: ResumeSkills = {
    featuredSkills: [], // We don't extract ratings from PDF
    descriptions: uniqueDescriptions
  };
  
  return { skills };
}; 