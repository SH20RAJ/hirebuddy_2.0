import React from 'react';
import { CoverLetterGenerator } from '@/components/resume/CoverLetterGenerator';

// Sample resume data for testing
const sampleResumeData = {
  personalInfo: {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe"
  },
  summary: "Experienced Full Stack Developer with 5+ years of expertise in React, Node.js, and cloud technologies. Proven track record of building scalable web applications and leading development teams. Passionate about creating user-centric solutions and staying current with emerging technologies.",
  experience: [
    {
      id: "1",
      jobTitle: "Senior Full Stack Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      startDate: "2022-01",
      endDate: "",
      current: true,
      description: "Lead development of customer-facing web applications using React, Node.js, and AWS. Collaborate with cross-functional teams to deliver high-quality software solutions.",
      achievements: [
        "Increased application performance by 40% through code optimization",
        "Led a team of 4 developers on a major product redesign",
        "Implemented CI/CD pipeline reducing deployment time by 60%"
      ]
    },
    {
      id: "2",
      jobTitle: "Full Stack Developer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: "2020-03",
      endDate: "2021-12",
      current: false,
      description: "Developed and maintained web applications using React, Express.js, and MongoDB. Worked closely with product managers and designers to implement new features.",
      achievements: [
        "Built responsive web application serving 10,000+ daily users",
        "Reduced API response time by 50% through database optimization",
        "Mentored 2 junior developers"
      ]
    }
  ],
  education: [
    {
      id: "1",
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      startDate: "2016-08",
      endDate: "2020-05",
      gpa: "3.8",
      honors: "Magna Cum Laude",
      coursework: ["Data Structures", "Algorithms", "Software Engineering", "Database Systems"]
    }
  ],
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker"],
    soft: ["Leadership", "Communication", "Problem Solving", "Team Collaboration"],
    languages: ["English", "Spanish"],
    frameworks: ["React", "Express.js", "Next.js", "Django", "Flask"]
  },
  projects: [
    {
      id: "1",
      name: "E-commerce Platform",
      description: "Built a full-stack e-commerce platform with React frontend and Node.js backend, featuring user authentication, payment processing, and inventory management.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
      link: "https://ecommerce-demo.com",
      github: "https://github.com/johndoe/ecommerce-platform",
      startDate: "2023-01",
      endDate: "2023-06"
    }
  ],
  certifications: [
    {
      id: "1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-03",
      expiryDate: "2026-03",
      credentialId: "AWS-SAA-123456",
      link: "https://aws.amazon.com/certification/"
    }
  ],
  languages: [
    {
      id: "1",
      language: "English",
      proficiency: "Native"
    },
    {
      id: "2",
      language: "Spanish",
      proficiency: "Conversational"
    }
  ],
  volunteer: [
    {
      id: "1",
      organization: "Code for Good",
      role: "Volunteer Developer",
      startDate: "2021-01",
      endDate: "2023-12",
      description: "Developed web applications for non-profit organizations to help them manage their operations more efficiently."
    }
  ],
  awards: [
    {
      id: "1",
      title: "Employee of the Year",
      issuer: "TechCorp Inc.",
      date: "2023-12",
      description: "Recognized for outstanding performance and leadership in delivering critical projects."
    }
  ]
};

const CoverLetterTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cover Letter Generator Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is a test page for the cover letter generator. It uses sample resume data 
            to demonstrate how the AI can create personalized cover letters based on job descriptions 
            and user preferences.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '80vh' }}>
          <CoverLetterGenerator resumeData={sampleResumeData} />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterTest; 