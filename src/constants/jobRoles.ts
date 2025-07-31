export const JOB_ROLES = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'Marketing Manager',
  'Sales Representative',
  'Business Analyst',
  'UI/UX Designer',
  'DevOps Engineer',
  'Project Manager',
  'Content Writer',
  'Digital Marketing Specialist',
  'Financial Analyst',
  'Human Resources Manager',
  'Customer Success Manager',
  'Operations Manager',
  'Other'
] as const;

export type JobRole = typeof JOB_ROLES[number];

export const DEFAULT_JOB_ROLE: JobRole = 'Software Engineer'; 