import type { ResumeProfile, ResumeSectionToLines } from "../../../types/resume";
import {
  extractWithFeatureScoring,
  emailFeatureSets,
  phoneFeatureSets,
  urlFeatureSets,
  nameFeatureSets,
  type FeatureSet
} from "./lib/feature-scoring";

export const extractProfile = (sections: ResumeSectionToLines): { profile: ResumeProfile } => {
  const profileLines = sections.profile || [];
  const summaryLines = sections.summary || sections.objective || sections.about || [];
  
  // Extract name (usually the first line or largest text)
  const name = extractWithFeatureScoring(profileLines, nameFeatureSets);
  
  // Extract email
  const email = extractWithFeatureScoring(profileLines, emailFeatureSets);
  
  // Extract phone
  const phone = extractWithFeatureScoring(profileLines, phoneFeatureSets);
  
  // Extract URL/website
  const url = extractWithFeatureScoring(profileLines, urlFeatureSets);
  
  // Extract location
  const locationFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(text), // City, State
      score: 10
    },
    {
      match: (text) => /\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b/.test(text), // City, Country
      score: 8
    },
    {
      match: (text) => /\d{5}(-\d{4})?/.test(text), // ZIP code
      score: 6
    }
  ];
  const location = extractWithFeatureScoring(profileLines, locationFeatureSets);
  
  // Extract summary (combine all summary lines)
  const summary = summaryLines.map(line => line.text).join(' ').trim();
  
  const profile: ResumeProfile = {
    name: name || "",
    email: email || "",
    phone: phone || "",
    url: url || "",
    summary: summary || "",
    location: location || ""
  };
  
  return { profile };
}; 