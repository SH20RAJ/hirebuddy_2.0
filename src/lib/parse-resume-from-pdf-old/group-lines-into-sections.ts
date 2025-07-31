import type { Lines, ResumeSectionToLines } from "../../types/resume";

/**
 * Step 3: Group lines into sections
 *
 * This identifies section headers and groups the following lines under each section.
 */
export const groupLinesIntoSections = (lines: Lines): ResumeSectionToLines => {
  const sections: ResumeSectionToLines = {};
  
  // Common section headers (case insensitive)
  const sectionHeaders = [
    'experience',
    'work experience',
    'professional experience',
    'employment',
    'employment history',
    'work history',
    'career',
    'career history',
    'professional background',
    'education',
    'academic background',
    'qualifications',
    'academic qualifications',
    'skills',
    'technical skills',
    'core competencies',
    'competencies',
    'skill set',
    'expertise',
    'projects',
    'personal projects',
    'key projects',
    'project experience',
    'summary',
    'professional summary',
    'executive summary',
    'profile',
    'professional profile',
    'objective',
    'career objective',
    'about',
    'about me',
    'contact',
    'contact information',
    'personal information',
    'certifications',
    'certificates',
    'licenses',
    'credentials',
    'professional certifications',
    'awards',
    'achievements',
    'honors',
    'honors and awards',
    'recognition',
    'accomplishments',
    'languages',
    'language skills',
    'interests',
    'hobbies',
    'personal interests',
    'volunteer',
    'volunteer experience',
    'volunteer work',
    'community service',
    'community involvement',
    'publications',
    'research',
    'references',
    'additional information',
    'other'
  ];
  
  let currentSection = 'profile'; // Default section for content at the top
  sections[currentSection] = [];
  
  for (const line of lines) {
    const lineText = line.text.toLowerCase().trim();
    
    // Check if this line is a section header
    const matchedHeader = sectionHeaders.find(header => {
      // Exact match or line starts with the header
      return lineText === header || 
             lineText.startsWith(header + ':') ||
             lineText.startsWith(header + ' ') ||
             (lineText.length <= header.length + 3 && lineText.includes(header));
    });
    
    if (matchedHeader) {
      // Start a new section
      currentSection = matchedHeader.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
    } else {
      // Add line to current section
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      sections[currentSection].push(line);
    }
  }
  
  // Clean up empty sections
  Object.keys(sections).forEach(key => {
    if (sections[key].length === 0) {
      delete sections[key];
    }
  });
  
  return sections;
}; 