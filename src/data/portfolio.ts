export type ProjectIconKey = "system" | "docs" | "automation" | "web";

export type Project = {
  title: string;
  description: string;
  tech: string[];
  status: string;
  github: string;
  demo?: string;
  imageUrl?: string;
  icon?: ProjectIconKey;
};

export type Certification = {
  name: string;
  issuer: string;
  date: string;
  credential?: string;
  imageUrl?: string;
  details?: string;
};

export type StackGroup = {
  category: string;
  items: string[];
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type TimelineItem = {
  period: string;
  title: string;
  detail: string;
};

export type SocialLink = { label: string; href: string };

export type Profile = {
  name: string;
  initials: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  summary: string;
  bio: string;
  goals: string;
  githubUser: string;
  imageUrl: string;
  socials: SocialLink[];
};

export type HomeShowcase = {
  projectTitles: string[];
  certificationNames: string[];
  stackItems: string[];
};

export type PortfolioData = {
  profile: Profile;
  home?: HomeShowcase;
  projects: Project[];
  stackGroups: StackGroup[];
  skillGroups?: SkillGroup[];
  certifications: Certification[];
  timeline: TimelineItem[];
};

const cloudinaryProfileImage =
  import.meta.env.VITE_PROFILE_IMAGE_URL ||
  (import.meta.env.VITE_CLOUDINARY_NAME
    ? `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload/f_auto,q_auto/railey_c6guls`
    : "");

export const fallbackPortfolio: PortfolioData = {
  profile: {
    name: "Railey S. Dela Peña",
    initials: "RDP",
    title: "Software Developer",
    location: "Calamba City, Laguna, Philippines",
    phone: "09271760712",
    email: "railey.solidum.delapena29@gmail.com",
    summary:
      "Software developer focused on responsive web applications, practical database-backed systems, and clean user experiences built with React, TypeScript, PHP, and MySQL.",
    bio:
      "I am a BS Information Technology graduate from City College of Calamba with freelance web development experience and OJT work building institutional systems. I enjoy designing, developing, maintaining, and troubleshooting websites across front-end, back-end, database, and API layers.",
    goals:
      "I am looking for a software development role where I can apply my programming skills, keep improving through real projects, and contribute through hard work, adaptability, and continuous learning.",
    githubUser: "RaileySawada",
    imageUrl: cloudinaryProfileImage,
    socials: [
      { label: "GitHub", href: "https://github.com/RaileySawada" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Email", href: "mailto:railey.solidum.delapena29@gmail.com" },
    ],
  },
  home: {
    projectTitles: [
      "Applicant Management with Decision Support and Data Analytics",
      "e-Docs Document Management System",
      "e-Formatter",
    ],
    certificationNames: ["Project Management For IT Students", "HTML Essentials", "Hackathon Champion"],
    stackItems: ["JavaScript", "TypeScript", "React", "Next.js", "Vue", "HTML", "CSS", "Tailwind CSS", "PHP", "MySQL", "PostgreSQL", "Bash"],
  },
  projects: [
    {
      title: "Applicant Management with Decision Support and Data Analytics",
      description:
        "A web-based applicant management system for Staff Search Asia Service Cooperative that digitizes submissions, tracks application statuses, supports hiring recommendations, and provides automated reporting and performance insights.",
      tech: ["PHP", "CSS", "JavaScript", "MySQL", "DSS", "Data Analytics"],
      status: "Capstone",
      github: "https://github.com/RaileySawada",
      icon: "system",
    },
    {
      title: "e-Docs Document Management System",
      description:
        "A PHP/MySQL document management platform for institutional research, extension, planning, and QA workflows with AI decision support and analytics insights for document and institutional data review.",
      tech: ["PHP", "MySQL", "AI Support", "Analytics"],
      status: "OJT",
      github: "https://github.com/RaileySawada",
      icon: "docs",
    },
    {
      title: "e-Formatter",
      description:
        "A React and TypeScript tool for automated research paper formatting using XML manipulation, created during OJT programming work at City College of Calamba.",
      tech: ["React", "TypeScript", "XML", "Automation"],
      status: "OJT",
      github: "https://github.com/RaileySawada",
      icon: "automation",
    },
  ],
  stackGroups: [
    {
      category: "Languages",
      items: ["JavaScript", "TypeScript", "PHP", "Bash"],
    },
    {
      category: "Frontend Frameworks",
      items: ["React", "Next.js", "Vue"],
    },
    {
      category: "Markup & Styling",
      items: ["HTML", "CSS", "Tailwind CSS"],
    },
    {
      category: "Backend & APIs",
      items: ["Node.js", "REST APIs", "XML"],
    },
    {
      category: "Databases",
      items: ["MySQL", "PostgreSQL", "Firestore"],
    },
    {
      category: "Cloud & Storage",
      items: ["Firebase", "Cloudinary", "Netlify"],
    },
    {
      category: "Developer Tools",
      items: ["Git"],
    },
    {
      category: "Data & Decision Systems",
      items: ["DSS", "Data Analytics", "Analytics", "AI Support"],
    },
  ],
  skillGroups: [
    {
      category: "Product Skills",
      items: ["Responsive UI", "Database Integration", "REST APIs", "Troubleshooting", "Maintenance", "Performance Improvements", "Client Coordination"],
    },
    {
      category: "Soft Skills",
      items: ["Time Management", "Critical Thinking", "Problem Solving", "Adaptability", "Continuous Learning"],
    },
  ],
  certifications: [
    {
      name: "Project Management For IT Students",
      issuer: "Adamson University",
      date: "2025/10",
      credential: "https://www.adamson.edu.ph/",
    },
    {
      name: "HTML Essentials",
      issuer: "Cisco Networking Academy",
      date: "2025/09",
      credential: "https://www.netacad.com/",
    },
    {
      name: "Hackathon Champion",
      issuer: "City College of Calamba",
      date: "2026/03",
      credential: "https://ccc.edu.ph/",
    },
    {
      name: "Outstanding Innovation Award",
      issuer: "City College of Calamba",
      date: "2026/05",
      credential: "https://ccc.edu.ph/",
    },
    {
      name: "Introduction to C++",
      issuer: "Sololearn",
      date: "2023/10",
      credential: "https://www.sololearn.com/",
    },
    {
      name: "C++ Intermediate",
      issuer: "Sololearn",
      date: "2023/11",
      credential: "https://www.sololearn.com/",
    },
    {
      name: "Introduction to Java",
      issuer: "Sololearn",
      date: "2023/10",
      credential: "https://www.sololearn.com/",
    },
    {
      name: "Java Intermediate",
      issuer: "Sololearn",
      date: "2023/10",
      credential: "https://www.sololearn.com/",
    },
    {
      name: "2nd Placer Skills Competition - Coding",
      issuer: "City College of Calamba",
      date: "2024/02",
      credential: "https://ccc.edu.ph/",
    },
  ],
  timeline: [
    {
      period: "Feb 2025 - Present",
      title: "Freelance Web Developer",
      detail:
        "Providing website design, development, maintenance, troubleshooting, front-end and back-end features, database/API integration, performance improvements, and client coordination.",
    },
    {
      period: "Sep 2025 - Feb 2026",
      title: "OJT Programmer at City College of Calamba",
      detail:
        "Developed e-Docs, integrated AI decision support and analytics insights, and built e-Formatter with React, TypeScript, and XML manipulation.",
    },
    {
      period: "Aug 2022 - May 2026",
      title: "BS Information Technology",
      detail: "Graduated from City College of Calamba with a GPA of 3.4 and recognition as a top performing student from 2022 to 2026.",
    },
    {
      period: "Apr 2021 - Mar 2022",
      title: "Delivery Rider at Shopee",
      detail: "Handled delivery and logistics operations, courier services, and last-mile e-commerce delivery in Calamba City, Laguna.",
    },
  ],
};

export const profile = fallbackPortfolio.profile;
export const projects = fallbackPortfolio.projects;
export const stackGroups = fallbackPortfolio.stackGroups;
export const certifications = fallbackPortfolio.certifications;
export const timeline = fallbackPortfolio.timeline;
