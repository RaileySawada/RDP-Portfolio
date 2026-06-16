import {
  ArrowRight,
  Clock,
  Download,
  Eye,
  FileText,
  GitBranch,
  Mail,
  MapPin,
  Users,
  type LucideIcon,
} from "lucide-react";
import Reveal from "../components/Reveal";
import { profile } from "../lib/content";

type ContactMethod = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
};

const contactMethods: ContactMethod[] = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    label: "Resume",
    value: "View PDF",
    href: profile.resumeUrl,
    icon: FileText,
  },
  {
    label: "GitHub",
    value: "github.com/RaileySawada",
    href: profile.links.github,
    icon: GitBranch,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/railey-dela-peña",
    href: profile.links.linkedin,
    icon: Users,
  },
];

export default function Contact() {
  return (
    <section className="page-section contact-page">
      <Reveal className="contact-hero">
        <div className="section-label">// 04 - contact</div>
        <h1 className="section-title">
          Let's build
          <br />
          <span>something great</span>
        </h1>
        <p>
          Open to freelance work, collaborations, and interesting problems. Drop
          a message and I will get back to you.
        </p>

        <div className="resume-preview-card compact-resume-preview">
          <div className="resume-preview-top">
            <div>
              <span>Resume preview</span>
              <strong>Railey Dela Peña</strong>
            </div>

            <div className="resume-preview-actions">
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                View
                <Eye size={15} />
              </a>

              <a href={profile.resumeUrl} download>
                Download
                <Download size={15} />
              </a>
            </div>
          </div>

          <a
            className="resume-preview-image-link"
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open resume PDF"
          >
            <img
              src="/resume/resume-preview.avif"
              alt="Resume preview of Railey Dela Peña"
              className="resume-preview-image"
            />
          </a>
        </div>
      </Reveal>

      <div className="contact-grid">
        <Reveal className="contact-panel">
          <div className="panel-icon">
            <Clock size={19} />
          </div>
          <h2>Availability</h2>
          <p>
            Available for selected freelance builds, AI-assisted workflows,
            Laravel/PHP systems, and React interfaces.
          </p>
          <div className="availability-list">
            <span>
              <MapPin size={15} />
              {profile.location}, {profile.timezone}
            </span>
            <span>
              <ArrowRight size={15} />
              Remote-friendly
            </span>
          </div>
        </Reveal>

        <div className="contact-methods">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            const opensNewTab =
              method.href.startsWith("http") ||
              method.href.includes("/resume/");

            return (
              <Reveal
                className="contact-method"
                delay={index * 80}
                key={method.label}
              >
                <a
                  href={method.href}
                  target={opensNewTab ? "_blank" : undefined}
                  rel={opensNewTab ? "noreferrer" : undefined}
                >
                  <div className="method-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span>{method.label}</span>
                    <strong>{method.value}</strong>
                  </div>
                  <ArrowRight size={17} />
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
