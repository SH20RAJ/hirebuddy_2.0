import type { ResumeSectionToLines } from "../../../types/resume";
import { type FeatureSet } from "./lib/feature-scoring";

export interface ResumeLanguage {
  language: string;
  proficiency: string;
}

export const extractLanguages = (sections: ResumeSectionToLines): { languages: ResumeLanguage[] } => {
  const languageLines = sections.languages || sections.languageskills || [];
  
  if (languageLines.length === 0) {
    return { languages: [] };
  }
  
  const languages: ResumeLanguage[] = [];
  
  // Common languages
  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Bengali',
    'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech',
    'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Turkish', 'Hebrew', 'Thai',
    'Vietnamese', 'Indonesian', 'Malay', 'Tagalog', 'Swahili', 'Urdu', 'Persian',
    'Farsi', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Cantonese'
  ];
  
  // Proficiency levels
  const proficiencyLevels = [
    'Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic', 'Beginner',
    'Professional', 'Conversational', 'Elementary', 'Limited',
    'A1', 'A2', 'B1', 'B2', 'C1', 'C2', // CEFR levels
    'ILR 0', 'ILR 1', 'ILR 2', 'ILR 3', 'ILR 4', 'ILR 5' // ILR scale
  ];
  
  // Feature sets for identifying languages and proficiency
  const languageFeatureSets: FeatureSet[] = [
    {
      match: (text) => commonLanguages.some(lang => 
        new RegExp(`\\b${lang}\\b`, 'i').test(text)
      ),
      score: 10
    }
  ];
  
  const proficiencyFeatureSets: FeatureSet[] = [
    {
      match: (text) => proficiencyLevels.some(level => 
        new RegExp(`\\b${level}\\b`, 'i').test(text)
      ),
      score: 10
    }
  ];
  
  for (const line of languageLines) {
    const text = line.text.trim();
    if (!text) continue;
    
    // Split by common delimiters
    const items = text.split(/[,;|•\-\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    for (const item of items) {
      // Check if this item contains a language
      const languageScore = languageFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(item) ? score + featureSet.score : score;
      }, 0);
      
      if (languageScore > 5) {
        // Extract language and proficiency
        let language = '';
        let proficiency = '';
        
        // Find the language name
        for (const lang of commonLanguages) {
          const regex = new RegExp(`\\b${lang}\\b`, 'i');
          if (regex.test(item)) {
            language = lang;
            break;
          }
        }
        
        // Find the proficiency level
        for (const level of proficiencyLevels) {
          const regex = new RegExp(`\\b${level}\\b`, 'i');
          if (regex.test(item)) {
            proficiency = level;
            break;
          }
        }
        
        // If no proficiency found, try to infer from context
        if (!proficiency) {
          if (item.toLowerCase().includes('native') || item.toLowerCase().includes('mother tongue')) {
            proficiency = 'Native';
          } else if (item.toLowerCase().includes('fluent')) {
            proficiency = 'Fluent';
          } else if (item.toLowerCase().includes('advanced')) {
            proficiency = 'Advanced';
          } else if (item.toLowerCase().includes('intermediate')) {
            proficiency = 'Intermediate';
          } else if (item.toLowerCase().includes('basic') || item.toLowerCase().includes('beginner')) {
            proficiency = 'Basic';
          } else if (item.toLowerCase().includes('conversational')) {
            proficiency = 'Conversational';
          } else if (item.toLowerCase().includes('professional')) {
            proficiency = 'Professional';
          }
        }
        
        if (language) {
          // Check if this language is already added
          const existingLanguage = languages.find(l => 
            l.language.toLowerCase() === language.toLowerCase()
          );
          
          if (!existingLanguage) {
            languages.push({
              language,
              proficiency: proficiency || 'Intermediate' // Default proficiency
            });
          }
        }
      }
    }
  }
  
  // If no languages found using feature matching, try simple text parsing
  if (languages.length === 0) {
    for (const line of languageLines) {
      const text = line.text.trim();
      if (!text) continue;
      
      // Check if the entire line might be a language
      for (const lang of commonLanguages) {
        const regex = new RegExp(`\\b${lang}\\b`, 'i');
        if (regex.test(text)) {
          const existingLanguage = languages.find(l => 
            l.language.toLowerCase() === lang.toLowerCase()
          );
          
          if (!existingLanguage) {
            languages.push({
              language: lang,
              proficiency: 'Intermediate' // Default proficiency
            });
          }
        }
      }
    }
  }
  
  return { languages };
}; 