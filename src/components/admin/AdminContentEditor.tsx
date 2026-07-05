import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import type { Certification, PortfolioData, Project, ProjectIconKey, SkillGroup, SocialLink, StackGroup } from "../../data/portfolio";
import { fallbackPortfolio } from "../../data/portfolio";
import { getPortfolioData, normalizePortfolioData } from "../../services/portfolio";
import { savePortfolioData } from "../../services/adminPortfolio";
import type { AdminSession } from "../../services/adminAuth";
import { uploadAdminImage } from "../../services/adminUpload";
import { ImageIcon, TrashIcon, UploadIcon } from "../ui/Icons";

type AdminContentEditorProps = {
  session: AdminSession;
};

type ContentSection = "home" | "links" | "projects" | "certifications" | "stack" | "skills";

const contentSections: { label: string; value: ContentSection }[] = [
  { label: "Home", value: "home" },
  { label: "Links", value: "links" },
  { label: "Projects", value: "projects" },
  { label: "Certifications", value: "certifications" },
  { label: "Stack", value: "stack" },
  { label: "Skills", value: "skills" },
];

const projectIcons: ProjectIconKey[] = ["system", "docs", "automation", "web"];

const emptyProject: Project = {
  title: "",
  description: "",
  tech: [],
  status: "",
  github: "",
  demo: "",
  imageUrl: "",
  icon: "web",
};

const emptyCertification: Certification = {
  name: "",
  issuer: "",
  date: "",
  credential: "",
  imageUrl: "",
  details: "",
};

const emptyGroup: StackGroup = {
  category: "",
  items: [],
};

export function AdminContentEditor({ session }: AdminContentEditorProps) {
  const navigate = useNavigate();
  const { section } = useParams();
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => normalizePortfolioData(fallbackPortfolio));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [message, setMessage] = useState("");
  const activeSection: ContentSection = isContentSection(section) ? section : "home";

  useEffect(() => {
    let isMounted = true;

    getPortfolioData()
      .then((data) => {
        if (isMounted) {
          setPortfolio(normalizePortfolioData(data));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isContentSection(section)) {
      navigate("/rdp-admin/content/home", { replace: true });
    }
  }, [navigate, section]);

  const stackItems = useMemo(() => Array.from(new Set(portfolio.stackGroups.flatMap((group) => group.items).filter(Boolean))), [portfolio.stackGroups]);

  const updateProfile = (key: keyof PortfolioData["profile"], value: string) => {
    setPortfolio((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [key]: value,
      },
    }));
  };

  const updateSocial = (index: number, key: keyof SocialLink, value: string) => {
    setPortfolio((current) => ({
      ...current,
      profile: {
        ...current.profile,
        socials: current.profile.socials.map((social, socialIndex) => (socialIndex === index ? { ...social, [key]: value } : social)),
      },
    }));
  };

  const addSocial = () => {
    setPortfolio((current) => ({
      ...current,
      profile: {
        ...current.profile,
        socials: [...current.profile.socials, { label: "Twitter", href: "" }],
      },
    }));
  };

  const removeSocial = (index: number) => {
    setPortfolio((current) => ({
      ...current,
      profile: {
        ...current.profile,
        socials: current.profile.socials.filter((_, socialIndex) => socialIndex !== index),
      },
    }));
  };

  const updateProject = (index: number, patch: Partial<Project>) => {
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) => (projectIndex === index ? { ...project, ...patch } : project)),
    }));
  };

  const removeProject = (index: number) => {
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.filter((_, projectIndex) => projectIndex !== index),
      home: {
        projectTitles: (current.home?.projectTitles || []).filter((title) => title !== current.projects[index]?.title),
        certificationNames: current.home?.certificationNames || [],
        stackItems: current.home?.stackItems || [],
      },
    }));
  };

  const updateCertification = (index: number, patch: Partial<Certification>) => {
    setPortfolio((current) => ({
      ...current,
      certifications: current.certifications.map((certification, certificationIndex) =>
        certificationIndex === index ? { ...certification, ...patch } : certification,
      ),
    }));
  };

  const removeCertification = (index: number) => {
    setPortfolio((current) => ({
      ...current,
      certifications: current.certifications.filter((_, certificationIndex) => certificationIndex !== index),
      home: {
        projectTitles: current.home?.projectTitles || [],
        certificationNames: (current.home?.certificationNames || []).filter((name) => name !== current.certifications[index]?.name),
        stackItems: current.home?.stackItems || [],
      },
    }));
  };

  const updateGroup = <T extends StackGroup | SkillGroup>(key: "stackGroups" | "skillGroups", index: number, patch: Partial<T>) => {
    setPortfolio((current) => ({
      ...current,
      [key]: (current[key] || []).map((group, groupIndex) => (groupIndex === index ? { ...group, ...patch } : group)),
    }));
  };

  const removeGroup = (key: "stackGroups" | "skillGroups", index: number) => {
    setPortfolio((current) => ({
      ...current,
      [key]: (current[key] || []).filter((_, groupIndex) => groupIndex !== index),
    }));
  };

  const toggleFeaturedProject = (title: string, checked: boolean) => {
    setPortfolio((current) => toggleFeaturedValue(current, "projectTitles", title, checked));
  };

  const toggleFeaturedCertification = (name: string, checked: boolean) => {
    setPortfolio((current) => toggleFeaturedValue(current, "certificationNames", name, checked));
  };

  const toggleFeaturedStack = (item: string, checked: boolean) => {
    setPortfolio((current) => toggleFeaturedValue(current, "stackItems", item, checked));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    const result = await savePortfolioData(session, prepareForSave(portfolio));

    setIsSaving(false);
    setMessage(result.ok ? "Portfolio content saved." : result.error);
  };

  const handleProjectImageUpload = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    const key = `project-${index}`;
    setUploadingKey(key);
    setMessage("");

    const result = await uploadAdminImage(session, file, "portfolio/projects");

    setUploadingKey("");
    if (result.ok) {
      updateProject(index, { imageUrl: result.url });
      setMessage("Project image uploaded.");
    } else {
      setMessage(result.error);
    }
  };

  const handleCertificationImageUpload = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    const key = `certification-${index}`;
    setUploadingKey(key);
    setMessage("");

    const result = await uploadAdminImage(session, file, "portfolio/certifications");

    setUploadingKey("");
    if (result.ok) {
      updateCertification(index, { imageUrl: result.url });
      setMessage("Certification image uploaded.");
    } else {
      setMessage(result.error);
    }
  };

  const renderContentSection = () => {
    if (activeSection === "home") {
      return (
        <>
          <EditorPanel title="Home profile">
            <AdminInput label="Preferred job title" value={portfolio.profile.title} onChange={(value) => updateProfile("title", value)} />
            <AdminTextarea label="Intro text" value={portfolio.profile.summary} onChange={(value) => updateProfile("summary", value)} />
            <AdminInput label="Location" value={portfolio.profile.location} onChange={(value) => updateProfile("location", value)} />
            <AdminInput label="Email" value={portfolio.profile.email} onChange={(value) => updateProfile("email", value)} />
            <AdminInput label="GitHub username" value={portfolio.profile.githubUser} onChange={(value) => updateProfile("githubUser", value)} />
          </EditorPanel>

          <EditorPanel title="Homepage showcase">
            <Checklist title="Projects" values={portfolio.projects.map((project) => project.title)} selected={portfolio.home?.projectTitles || []} onToggle={toggleFeaturedProject} />
            <Checklist
              title="Certifications"
              values={portfolio.certifications.map((certification) => certification.name)}
              selected={portfolio.home?.certificationNames || []}
              onToggle={toggleFeaturedCertification}
            />
            <Checklist title="Stack" values={stackItems} selected={portfolio.home?.stackItems || []} onToggle={toggleFeaturedStack} />
          </EditorPanel>
        </>
      );
    }

    if (activeSection === "links") {
      return (
        <EditorPanel
          title="Links"
          count={portfolio.profile.socials.length}
          action={
            <button className="button-secondary admin-inline-button" type="button" onClick={addSocial}>
              Add link
            </button>
          }
        >
          {portfolio.profile.socials.length === 0 ? <EmptyState label="No links yet. Add your first one." /> : null}
          {portfolio.profile.socials.map((social, index) => (
            <div className="admin-editor-item" key={`${social.label}-${index}`}>
              <div className="admin-editor-item-head">
                <span className="admin-editor-item-index">Link {String(index + 1).padStart(2, "0")}</span>
                <button className="admin-icon-button" type="button" aria-label="Delete link" onClick={() => removeSocial(index)}>
                  <TrashIcon />
                </button>
              </div>
              <div className="admin-editor-row admin-editor-row-2">
                <AdminInput label="Label" value={social.label} onChange={(value) => updateSocial(index, "label", value)} />
                <AdminInput label="URL" value={social.href} onChange={(value) => updateSocial(index, "href", value)} />
              </div>
            </div>
          ))}
        </EditorPanel>
      );
    }

    if (activeSection === "projects") {
      return (
        <EditorPanel
          title="Projects"
          count={portfolio.projects.length}
          action={
            <button className="button-secondary admin-inline-button" type="button" onClick={() => setPortfolio((current) => ({ ...current, projects: [...current.projects, emptyProject] }))}>
              Add project
            </button>
          }
        >
          {portfolio.projects.length === 0 ? <EmptyState label="No projects yet. Add your first one." /> : null}
          {portfolio.projects.map((project, index) => (
            <div className="admin-editor-item" key={`${project.title}-${index}`}>
              <div className="admin-editor-item-head">
                <span className="admin-editor-item-index">{project.title.trim() || `Project ${String(index + 1).padStart(2, "0")}`}</span>
                <button className="admin-icon-button" type="button" aria-label="Delete project" onClick={() => removeProject(index)}>
                  <TrashIcon />
                </button>
              </div>
              <AdminInput label="Title" value={project.title} onChange={(value) => updateProject(index, { title: value })} />
              <AdminTextarea label="Description" value={project.description} onChange={(value) => updateProject(index, { description: value })} />
              <div className="admin-editor-row">
                <AdminInput label="Status" value={project.status} onChange={(value) => updateProject(index, { status: value })} />
                <AdminInput label="GitHub" value={project.github} onChange={(value) => updateProject(index, { github: value })} />
                <AdminInput label="Demo / npm / deployment" value={project.demo || ""} onChange={(value) => updateProject(index, { demo: value })} />
              </div>
              <ImageField
                label="Project image"
                value={project.imageUrl || ""}
                isUploading={uploadingKey === `project-${index}`}
                onChange={(value) => updateProject(index, { imageUrl: value })}
                onUpload={(file) => handleProjectImageUpload(index, file)}
              />
              <div className="admin-editor-row admin-editor-row-2">
                <AdminTextarea label="Tech, one per line" value={toLines(project.tech)} onChange={(value) => updateProject(index, { tech: fromLines(value) })} />
                <label className="admin-field">
                  <span>Icon</span>
                  <select value={project.icon || "web"} onChange={(event) => updateProject(index, { icon: event.target.value as ProjectIconKey })}>
                    {projectIcons.map((icon) => (
                      <option value={icon} key={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </EditorPanel>
      );
    }

    if (activeSection === "certifications") {
      return (
        <EditorPanel
          title="Certifications"
          count={portfolio.certifications.length}
          action={
            <button
              className="button-secondary admin-inline-button"
              type="button"
              onClick={() => setPortfolio((current) => ({ ...current, certifications: [...current.certifications, emptyCertification] }))}
            >
              Add certification
            </button>
          }
        >
          {portfolio.certifications.length === 0 ? <EmptyState label="No certifications yet. Add your first one." /> : null}
          {portfolio.certifications.map((certification, index) => (
            <div className="admin-editor-item" key={`${certification.name}-${index}`}>
              <div className="admin-editor-item-head">
                <span className="admin-editor-item-index">{certification.name.trim() || `Certification ${String(index + 1).padStart(2, "0")}`}</span>
                <button className="admin-icon-button" type="button" aria-label="Delete certification" onClick={() => removeCertification(index)}>
                  <TrashIcon />
                </button>
              </div>
              <div className="admin-editor-row">
                <AdminInput label="Name" value={certification.name} onChange={(value) => updateCertification(index, { name: value })} />
                <AdminInput label="Issuer" value={certification.issuer} onChange={(value) => updateCertification(index, { issuer: value })} />
                <AdminInput label="Date" value={certification.date} onChange={(value) => updateCertification(index, { date: value })} />
              </div>
              <AdminInput label="Credential link" value={certification.credential || ""} onChange={(value) => updateCertification(index, { credential: value })} />
              <ImageField
                label="Certificate image"
                value={certification.imageUrl || ""}
                isUploading={uploadingKey === `certification-${index}`}
                onChange={(value) => updateCertification(index, { imageUrl: value })}
                onUpload={(file) => handleCertificationImageUpload(index, file)}
              />
              <AdminTextarea label="Details" value={certification.details || ""} onChange={(value) => updateCertification(index, { details: value })} />
            </div>
          ))}
        </EditorPanel>
      );
    }

    if (activeSection === "stack") {
      return (
        <GroupEditor
          title="Stack"
          groups={portfolio.stackGroups}
          onAdd={() => setPortfolio((current) => ({ ...current, stackGroups: [...current.stackGroups, emptyGroup] }))}
          onRemove={(index) => removeGroup("stackGroups", index)}
          onUpdate={(index, patch) => updateGroup("stackGroups", index, patch)}
        />
      );
    }

    return (
      <GroupEditor
        title="Skills"
        groups={portfolio.skillGroups || []}
        onAdd={() => setPortfolio((current) => ({ ...current, skillGroups: [...(current.skillGroups || []), emptyGroup] }))}
        onRemove={(index) => removeGroup("skillGroups", index)}
        onUpdate={(index, patch) => updateGroup("skillGroups", index, patch)}
      />
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <header className="admin-dashboard-header">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Portfolio</p>
          <h1>Content Editor</h1>
        </div>
        <button className="button-primary admin-save-button" type="button" onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? <span className="admin-spinner" aria-hidden="true" /> : null}
          <span>{isSaving ? "Saving..." : "Save changes"}</span>
        </button>
      </header>

      {message ? <p className="admin-editor-message">{message}</p> : null}

      {renderContentSection()}
    </div>
  );
}

function EditorPanel({ title, count, action, children }: { title: string; count?: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="admin-editor-panel">
      <div className="admin-editor-panel-heading">
        <div className="admin-editor-panel-title">
          <h2>{title}</h2>
          {typeof count === "number" ? <span className="admin-editor-panel-count">{count}</span> : null}
        </div>
        {action}
      </div>
      <div className="admin-editor-panel-body">{children}</div>
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="admin-editor-empty">{label}</p>;
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function AdminTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea value={value} rows={4} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ImageField({
  label,
  value,
  isUploading,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  isUploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File | undefined) => void;
}) {
  return (
    <div className="admin-image-field">
      <div className="admin-image-preview">
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className="admin-image-placeholder">
            <ImageIcon className="h-6 w-6" />
          </span>
        )}
      </div>
      <div className="admin-image-controls">
        <AdminInput label={`${label} URL`} value={value} onChange={onChange} />
        <label className="admin-upload-button">
          <input
            accept="image/*"
            type="file"
            disabled={isUploading}
            onChange={(event) => {
              onUpload(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          {isUploading ? <span className="admin-spinner" aria-hidden="true" /> : <UploadIcon className="h-4 w-4" />}
          <span>{isUploading ? "Uploading..." : "Upload image"}</span>
        </label>
        {value ? (
          <button className="admin-image-clear" type="button" onClick={() => onChange("")}>
            <TrashIcon className="h-3.5 w-3.5" />
            <span>Remove</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Checklist({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string, checked: boolean) => void }) {
  return (
    <div className="admin-checklist">
      <h3>{title}</h3>
      <div>
        {values.filter(Boolean).map((value) => (
          <label key={value}>
            <input type="checkbox" checked={selected.includes(value)} onChange={(event) => onToggle(value, event.target.checked)} />
            <span>{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function GroupEditor({
  title,
  groups,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string;
  groups: StackGroup[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<StackGroup>) => void;
}) {
  return (
    <EditorPanel
      title={title}
      count={groups.length}
      action={
        <button className="button-secondary admin-inline-button" type="button" onClick={onAdd}>
          Add category
        </button>
      }
    >
      {groups.length === 0 ? <EmptyState label="No categories yet. Add your first one." /> : null}
      {groups.map((group, index) => (
        <div className="admin-editor-item" key={`${group.category}-${index}`}>
          <div className="admin-editor-item-head">
            <span className="admin-editor-item-index">{group.category.trim() || `Category ${String(index + 1).padStart(2, "0")}`}</span>
            <button className="admin-icon-button" type="button" aria-label="Delete category" onClick={() => onRemove(index)}>
              <TrashIcon />
            </button>
          </div>
          <AdminInput label="Category" value={group.category} onChange={(value) => onUpdate(index, { category: value })} />
          <AdminTextarea label="Items, one per line" value={toLines(group.items)} onChange={(value) => onUpdate(index, { items: fromLines(value) })} />
        </div>
      ))}
    </EditorPanel>
  );
}

function toggleFeaturedValue(portfolio: PortfolioData, key: "projectTitles" | "certificationNames" | "stackItems", value: string, checked: boolean): PortfolioData {
  const current = portfolio.home?.[key] || [];
  const next = checked ? Array.from(new Set([...current, value])) : current.filter((item) => item !== value);

  return {
    ...portfolio,
    home: {
      ...portfolio.home,
      projectTitles: portfolio.home?.projectTitles || [],
      certificationNames: portfolio.home?.certificationNames || [],
      stackItems: portfolio.home?.stackItems || [],
      [key]: next,
    },
  };
}

function prepareForSave(portfolio: PortfolioData): PortfolioData {
  return normalizePortfolioData({
    ...portfolio,
    projects: portfolio.projects.filter((project) => project.title.trim()).map((project) => trimOptionalFields(project)),
    certifications: portfolio.certifications.filter((certification) => certification.name.trim()).map((certification) => trimOptionalFields(certification)),
    stackGroups: portfolio.stackGroups.filter((group) => group.category.trim() && group.items.length),
    skillGroups: (portfolio.skillGroups || []).filter((group) => group.category.trim() && group.items.length),
  });
}

function trimOptionalFields<T extends Record<string, unknown>>(item: T): T {
  return Object.fromEntries(Object.entries(item).filter(([, value]) => value !== "")) as T;
}

function toLines(items: string[]) {
  return items.join("\n");
}

function fromLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isContentSection(section: string | undefined): section is ContentSection {
  return contentSections.some((item) => item.value === section);
}
