import type { ResumeSectionToLines } from "../../../types/resume";
import { type FeatureSet } from "./lib/feature-scoring";

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
  credentialId: string;
}

export const extractCertifications = (sections: ResumeSectionToLines): { certifications: ResumeCertification[] } => {
  const certificationLines = sections.certifications || sections.certificates || sections.licenses || sections.credentials || [];
  
  if (certificationLines.length === 0) {
    return { certifications: [] };
  }
  
  const certifications: ResumeCertification[] = [];
  let currentCertification: Partial<ResumeCertification> = {};
  
  // Feature sets for identifying different parts of certifications
  const certificationNameFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Certified|Certificate|Certification|License|Professional|Associate|Expert|Specialist)\b/i.test(text),
      score: 10
    },
    {
      match: (text) => /\b(AWS|Azure|Google|Microsoft|Oracle|Cisco|CompTIA|PMP|CISSP|CPA|CFA|FRM)\b/i.test(text),
      score: 12
    },
    {
      match: (text) => /^[A-Z][A-Za-z\s\-()0-9]+$/.test(text.trim()) && text.length > 5 && text.length < 80,
      score: 5
    }
  ];
  
  const issuerFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(Amazon|Microsoft|Google|Oracle|Cisco|CompTIA|PMI|ISC2|AICPA|CFA Institute)\b/i.test(text),
      score: 12
    },
    {
      match: (text) => /\b(Inc|LLC|Corp|Company|Ltd|Limited|Institute|Association|Organization)\b/i.test(text),
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
    },
    {
      match: (text) => /\b(Expires?|Valid|Expiry)\b/i.test(text),
      score: 6
    }
  ];
  
  const credentialIdFeatureSets: FeatureSet[] = [
    {
      match: (text) => /\b(ID|Credential|Certificate|License)\s*:?\s*[A-Z0-9\-]+\b/i.test(text),
      score: 10
    },
    {
      match: (text) => /^[A-Z0-9\-]{6,}$/.test(text.trim()),
      score: 8
    }
  ];
  
  for (let i = 0; i < certificationLines.length; i++) {
    const line = certificationLines[i];
    const text = line.text.trim();
    
    if (!text) continue;
    
    // Check if this line contains a certification name (likely start of new certification)
    const nameScore = certificationNameFeatureSets.reduce((score, featureSet) => {
      return featureSet.match(text) ? score + featureSet.score : score;
    }, 0);
    
    if (nameScore > 8) {
      // Save previous certification if it exists
      if (currentCertification.name) {
        certifications.push({
          name: currentCertification.name || "",
          issuer: currentCertification.issuer || "",
          date: currentCertification.date || "",
          expiryDate: currentCertification.expiryDate || "",
          credentialId: currentCertification.credentialId || ""
        });
      }
      
      // Start new certification
      currentCertification = { name: text };
    } else {
      // Try to identify issuer, date, expiry date, or credential ID
      const issuerScore = issuerFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      const dateScore = dateFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      const credentialScore = credentialIdFeatureSets.reduce((score, featureSet) => {
        return featureSet.match(text) ? score + featureSet.score : score;
      }, 0);
      
      if (issuerScore > 5 && !currentCertification.issuer) {
        currentCertification.issuer = text;
      } else if (credentialScore > 8 && !currentCertification.credentialId) {
        currentCertification.credentialId = text;
      } else if (dateScore > 7) {
        if (text.toLowerCase().includes('expir') || text.toLowerCase().includes('valid')) {
          if (!currentCertification.expiryDate) {
            currentCertification.expiryDate = text;
          }
        } else if (!currentCertification.date) {
          currentCertification.date = text;
        }
      } else if (text.length > 10 && !currentCertification.name) {
        // This might be a certification name if we haven't found one yet
        currentCertification.name = text;
      }
    }
  }
  
  // Don't forget the last certification
  if (currentCertification.name) {
    certifications.push({
      name: currentCertification.name || "",
      issuer: currentCertification.issuer || "",
      date: currentCertification.date || "",
      expiryDate: currentCertification.expiryDate || "",
      credentialId: currentCertification.credentialId || ""
    });
  }
  
  return { certifications };
}; 