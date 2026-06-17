import {
  Bot,
  Building2,
  FileText,
  IdCard,
  PenTool,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const profile = {
  name: "Railey Dela Peña",
  shortName: "Railey",
  role: "Full-Stack Developer",
  location: "Philippines",
  timezone: "UTC+8",
  email: "railey.solidum.delapena29@gmail.com",
  resumeUrl: "/resume/RaileyDelaPena.pdf",
  logoUrl: "/logo/rdp-mark.png",
  logoSquareUrl: "/logo/rdp-mark-square.png",
  links: {
    github: "https://github.com/RaileySawada",
    linkedin: "https://www.linkedin.com/in/railey-dela-pe%C3%B1a-451a11372/",
  },
};

export const isAvailable = true;

export type SkillLevel = "Expert" | "Advanced" | "Intermediate" | "Novice";

export type Skill = {
  name: string;
  level: SkillLevel;
};

export type SkillGroup = {
  label: string;
  skills: Skill[];
};

export type Project = {
  name: string;
  description: string;
  stack: string[];
  icon: LucideIcon;
  link?: string;
  linkLabel?: string;
};

export type TimelineItem = {
  title: string;
  organization: string;
  period: string;
  details: string[];
};

export type CredentialItem = {
  title: string;
  issuer: string;
  date: string;
};

export const heroWords = ["think", "scale", "adapt", "decide", "ship"];

export const stats = [
  { value: "6+", label: "Projects shipped" },
  { value: "20+", label: "Technologies" },
  { value: "AI", label: "Integrated systems" },
];

export const skillGroups: SkillGroup[] = [
  {
    label: "Frontend",
    skills: [
      { name: "HTML5", level: "Advanced" },
      { name: "CSS3", level: "Expert" },
      { name: "JavaScript", level: "Intermediate" },
      { name: "Tailwind CSS", level: "Expert" },
      { name: "TypeScript", level: "Intermediate" },
      { name: "React", level: "Intermediate" },
      { name: "Alpine.js", level: "Novice" },
      { name: "Vue", level: "Novice" },
      { name: "Next.js", level: "Novice" },
    ],
  },
  {
    label: "Backend",
    skills: [
      { name: "PHP", level: "Advanced" },
      { name: "Laravel", level: "Intermediate" },
      { name: "Python", level: "Intermediate" },
      { name: "Express.js", level: "Novice" },
      { name: "Java", level: "Intermediate" },
      { name: "C++", level: "Intermediate" },
    ],
  },
  {
    label: "Data & DevOps",
    skills: [
      { name: "MySQL", level: "Advanced" },
      { name: "PostgreSQL", level: "Advanced" },
      { name: "Git", level: "Intermediate" },
      { name: "Bash Script", level: "Intermediate" },
      { name: "Docker", level: "Novice" },
    ],
  },
];

export const education: TimelineItem[] = [
  {
    title: "Bachelor of Science in Information Technology",
    organization: "City College of Calamba",
    period: "Aug 2022 - May 2026",
    details: [
      "GPA 3.4",
      "Top Performing Student from 2022 to 2026",
      "Focused on software development, web systems, database-driven applications, and academic technology projects.",
    ],
  },
];

export const experience: TimelineItem[] = [
  {
    title: "Web Developer",
    organization: "Freelance",
    period: "Feb 2025 - Present",
    details: [
      "Designs, develops, maintains, and troubleshoots responsive websites for client requirements.",
      "Builds front-end and back-end features, integrates databases and APIs, fixes bugs, improves performance, and coordinates directly with clients for revisions and deployment.",
    ],
  },
  {
    title: "OJT Programmer",
    organization: "City College of Calamba",
    period: "Sep 2025 - Feb 2026",
    details: [
      "Developed e-Docs, a PHP/MySQL document management system for institutional research, extension, planning, and QA workflows.",
      "Integrated AI decision support and analytics insights for document and institutional data review.",
      "Built e-Formatter, a React/TypeScript tool for automated research paper formatting using XML manipulation.",
    ],
  },
  {
    title: "Delivery Rider",
    organization: "Shopee | Brgy. Paciano, Calamba City, Laguna",
    period: "Apr 2021 - Mar 2022",
    details: [
      "Handled delivery and logistics operations, courier and parcel delivery services, and last-mile e-commerce delivery.",
    ],
  },
];

export const resumeHighlights = [
  "Builds MySQL-based systems, Laravel/PHP workflows, React interfaces, and TypeScript tools.",
  "Interested in AI decision support, data analytics, document intelligence, and developer tooling.",
  "Combines technical execution with time management, critical thinking, and problem-solving discipline.",
];

export const certifications: CredentialItem[] = [
  {
    title: "Project Management for IT Students",
    issuer: "Adamson University",
    date: "Oct 2025",
  },
  {
    title: "HTML Essentials",
    issuer: "Cisco Networking Academy",
    date: "Sep 2025",
  },
  {
    title: "Introduction to C++",
    issuer: "Sololearn",
    date: "Oct 2023",
  },
  {
    title: "C++ Intermediate",
    issuer: "Sololearn",
    date: "Nov 2023",
  },
  {
    title: "Introduction to Java",
    issuer: "Sololearn",
    date: "Oct 2023",
  },
  {
    title: "Java Intermediate",
    issuer: "Sololearn",
    date: "Oct 2023",
  },
];

export const achievements: CredentialItem[] = [
  {
    title: "Hackathon Champion",
    issuer: "City College of Calamba",
    date: "Mar 2026",
  },
  {
    title: "Outstanding Innovation Award",
    issuer: "City College of Calamba",
    date: "May 2026",
  },
  {
    title: "2nd Placer Skills Competition - Coding",
    issuer: "City College of Calamba",
    date: "Feb 2024",
  },
];

export const languages = [
  { language: "Tagalog", level: "Native" },
  { language: "English", level: "Basic" },
];

export const projects: Project[] = [
  {
    name: "Formless AI",
    description:
      "Automatically fills online forms using AI inference powered by OpenAI and Mistral models, reducing manual data entry friction across web workflows.",
    stack: ["HTML", "JavaScript", "OpenAI API", "Mistral"],
    icon: Bot,
  },
  {
    name: "e-Docs",
    description:
      "Institutional document management system built for City College of Calamba (CCC), supporting research, extension, planning, and quality assurance workflows with AI-assisted document review and decision support.",
    stack: ["PHP", "JavaScript", "Tailwind", "CSS", "AI Integration"],
    icon: FileText,
    link: "https://edocs.ccc.edu.ph",
    linkLabel: "View e-Docs",
  },
  {
    name: "Applicant Management System",
    description:
      "Full-cycle recruitment platform for Staff Search Asia with applicant-job matching, shortlisting, job posting, and analytics dashboards.",
    stack: ["PHP", "HTML", "CSS", "JavaScript", "Decision Support"],
    icon: Building2,
  },
  {
    name: "Scafkit CLI",
    description:
      "npm-based scaffolding and build helper for PHP MVC, PERN, React, and Laravel workflows, built to generate starter projects, automate local tooling, and package Laravel apps for deployment.",
    stack: ["JavaScript", "Node.js", "npm Package", "CLI", "Laravel"],
    icon: Zap,
    link: "https://www.npmjs.com/package/scafkit-cli",
    linkLabel: "View npm package",
  },
  {
    name: "e-Formatter",
    description:
      "Research manuscript formatter built for City College of Calamba (CCC), designed to format academic papers based on CCC guidelines and selected international conference standards.",
    stack: ["React", "TypeScript", "Tailwind", "CSS"],
    icon: PenTool,
    link: "https://e-formatter.netlify.app",
    linkLabel: "View e-Formatter",
  },
  {
    name: "Resumakr",
    description:
      "Polished resume builder that lets users craft professional CVs with live preview and export using a clean component architecture.",
    stack: ["React", "TypeScript", "Tailwind", "CSS"],
    icon: IdCard,
    link: "https://resumakr.netlify.app",
    linkLabel: "View Resumakr",
  },
];
