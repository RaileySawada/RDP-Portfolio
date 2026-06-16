import { FileText, GitBranch, Mail, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { profile } from "../lib/content";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="footer-logo" to="/">
            <img src={profile.logoSquareUrl} alt="" className="brand-mark" />
            <span className="brand-copy">
              {profile.shortName} <strong>Dela Peña</strong>
            </span>
          </Link>
          <p>
            Full-stack developer building AI-integrated systems, developer
            tooling, and polished web experiences from the {profile.location}.
          </p>
          <div className="footer-location">
            <MapPin size={15} />
            <span>{profile.location} · Shipping globally</span>
          </div>
        </div>

        <div className="footer-column">
          <span className="footer-heading">Navigation</span>
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="footer-column">
          <span className="footer-heading">Connect</span>
          <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
            Resume
          </a>
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          Copyright &copy; {new Date().getFullYear()} {profile.name}. Built with
          React, TypeScript, and Tailwind CSS.
        </span>
        <div className="footer-socials">
          <a
            href={profile.links.github}
            aria-label="GitHub"
            target="_blank"
            rel="noreferrer"
          >
            <GitBranch size={17} />
          </a>
          <a
            href={profile.links.linkedin}
            aria-label="LinkedIn"
            target="_blank"
            rel="noreferrer"
          >
            <Users size={17} />
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Email Railey">
            <Mail size={17} />
          </a>
          <a
            href={profile.resumeUrl}
            aria-label="Open resume"
            target="_blank"
            rel="noreferrer"
          >
            <FileText size={17} />
          </a>
        </div>
      </div>
    </footer>
  );
}
