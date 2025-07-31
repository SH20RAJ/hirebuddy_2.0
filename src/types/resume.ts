export interface ResumeProfile {
  name: string;
  email: string;
  phone: string;
  url: string;
  linkedin: string;
  github: string;
  summary: string;
  location: string;
}

export interface ResumeWorkExperience {
  company: string;
  jobTitle: string;
  date: string;
  jobDescription: string;
  achievements: string[];
  descriptions: string[];
}

export interface ResumeEducation {
  school: string;
  degree: string;
  date: string;
  gpa: string;
  coursework: string[];
  honors: string[];
  activities: string[];
  descriptions: string[];
}

export interface ResumeProject {
  project: string;
  date: string;
  descriptions: string[];
}

export interface FeaturedSkill {
  skill: string;
  rating: number;
}

export interface ResumeSkills {
  programmingLanguages: string[];
  frameworks: string[];
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  featuredSkills: FeaturedSkill[];
  descriptions: string[];
}

export interface ResumeAward {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface ResumeVolunteer {
  organization: string;
  role: string;
  date: string;
  descriptions: string[];
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
  credentialId: string;
}

export interface ResumeLanguage {
  language: string;
  proficiency: string;
}

export interface ResumeCustom {
  descriptions: string[];
}

export interface Resume {
  profile: ResumeProfile;
  workExperiences: ResumeWorkExperience[];
  educations: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  awards: ResumeAward[];
  volunteers: ResumeVolunteer[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
  custom: ResumeCustom;
}

export type ResumeKey = keyof Resume;

// PDF parsing types
export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}

export type TextItems = TextItem[];

export interface Line {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Lines = Line[];

export interface ResumeSectionToLines {
  [sectionName: string]: Lines;
} 