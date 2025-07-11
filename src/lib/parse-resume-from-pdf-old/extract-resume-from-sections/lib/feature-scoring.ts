import type { Lines } from "../../../../types/resume";

export interface FeatureSet {
  match: (text: string) => boolean;
  score: number;
}

/**
 * Feature scoring system for extracting resume information.
 * Each text item is scored based on various features, and the highest scoring item is selected.
 */
export const extractWithFeatureScoring = (
  lines: Lines,
  featureSets: FeatureSet[]
): string => {
  let bestMatch = "";
  let bestScore = -Infinity;
  
  for (const line of lines) {
    let score = 0;
    
    for (const featureSet of featureSets) {
      if (featureSet.match(line.text)) {
        score += featureSet.score;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = line.text;
    }
  }
  
  return bestMatch;
};

/**
 * Extract multiple items using feature scoring
 */
export const extractMultipleWithFeatureScoring = (
  lines: Lines,
  featureSets: FeatureSet[],
  minScore: number = 0
): string[] => {
  const matches: Array<{ text: string; score: number }> = [];
  
  for (const line of lines) {
    let score = 0;
    
    for (const featureSet of featureSets) {
      if (featureSet.match(line.text)) {
        score += featureSet.score;
      }
    }
    
    if (score >= minScore) {
      matches.push({ text: line.text, score });
    }
  }
  
  // Sort by score (highest first) and return text
  return matches
    .sort((a, b) => b.score - a.score)
    .map(match => match.text);
};

// Common feature sets
export const emailFeatureSets: FeatureSet[] = [
  {
    match: (text) => /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text),
    score: 10
  }
];

export const phoneFeatureSets: FeatureSet[] = [
  {
    match: (text) => /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/.test(text),
    score: 10
  },
  {
    match: (text) => /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text),
    score: 8
  }
];

export const urlFeatureSets: FeatureSet[] = [
  {
    match: (text) => /https?:\/\/[^\s]+/.test(text),
    score: 10
  },
  {
    match: (text) => /www\.[^\s]+/.test(text),
    score: 8
  },
  {
    match: (text) => /linkedin\.com\/in\/[^\s]+/.test(text),
    score: 9
  },
  {
    match: (text) => /github\.com\/[^\s]+/.test(text),
    score: 9
  }
];

export const nameFeatureSets: FeatureSet[] = [
  {
    match: (text) => /^[A-Z][a-z]+ [A-Z][a-z]+/.test(text.trim()),
    score: 8
  },
  {
    match: (text) => text.split(' ').length >= 2 && text.split(' ').length <= 4,
    score: 5
  },
  {
    match: (text) => /^[A-Z]/.test(text.trim()),
    score: 3
  }
]; 