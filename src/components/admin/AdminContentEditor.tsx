import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import type { Certification, PortfolioData, Project, SkillGroup, SocialLink, StackGroup } from "../../data/portfolio";
import { fallbackPortfolio } from "../../data/portfolio";
import { getPortfolioData, normalizePortfolioData } from "../../services/portfolio";
import { savePortfolioData } from "../../services/adminPortfolio";
import type { AdminSession } from "../../services/adminAuth";
import { PlusIcon, SocialIcon, TrashIcon } from "../ui/Icons";
import { AdminProjectManager } from "./AdminProjectManager";
import { AdminCertificationManager } from "./AdminCertificationManager";

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

const emptyGroup: StackGroup = {
  category: "",
  items: [],
};

const linkOptions = ["GitHub", "LinkedIn", "X", "Email", "Portfolio", "Resume", "Facebook", "Instagram", "YouTube", "TikTok", "Discord", "Phone"] as const;
type LinkOption = (typeof linkOptions)[number];
type SaveStatus = "idle" | "saving" | "saved" | "error";

const sectionDetails: Record<Exclude<ContentSection, "projects">, { eyebrow: string; title: string; description: string }> = {
  home: {
    eyebrow: "Homepage",
    title: "Home content",
    description: "Update the profile details and choose the featured work shown on the first page.",
  },
  links: {
    eyebrow: "Profile",
    title: "Links",
    description: "Manage the social and contact links shown across the portfolio.",
  },
  certifications: {
    eyebrow: "Credentials",
    title: "Certifications",
    description: "Review certificates exactly as they appear on the public Certifications page.",
  },
  stack: {
    eyebrow: "Toolkit",
    title: "Stack",
    description: "Organize the technologies shown on the public Stack page.",
  },
  skills: {
    eyebrow: "Capabilities",
    title: "Skills",
    description: "Group practical and soft skills into clean public-facing categories.",
  },
};

export function AdminContentEditor({ session }: AdminContentEditorProps) {
  const navigate = useNavigate();
  const { section } = useParams();
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => normalizePortfolioData(fallbackPortfolio));
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");
  const hasLoadedPortfolio = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!hasLoadedPortfolio.current) {
      hasLoadedPortfolio.current = true;
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    setSaveStatus("saving");
    saveTimer.current = setTimeout(() => {
      savePortfolioData(session, prepareForSave(portfolio)).then((result) => {
        setSaveStatus(result.ok ? "saved" : "error");
        setMessage(result.ok ? "" : result.error);
      });
    }, 700);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [isLoading, portfolio, session]);

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
        socials: [...current.profile.socials, { label: "GitHub", href: "" }],
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

  const addProject = (project: Project) => {
    setPortfolio((current) => ({
      ...current,
      projects: [...current.projects, project],
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

  const addCertification = (certification: Certification) => {
    setPortfolio((current) => ({
      ...current,
      certifications: [...current.certifications, certification],
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

  const renderContentSection = () => {
    if (activeSection === "home") {
      const homeStats = [
        { label: "Featured projects", value: portfolio.home?.projectTitles.length || 0 },
        { label: "Featured certificates", value: portfolio.home?.certificationNames.length || 0 },
        { label: "Featured stack", value: portfolio.home?.stackItems.length || 0 },
      ];

      return (
        <AdminSectionLayout details={sectionDetails.home} stats={homeStats}>
          <div className="admin-editor-split">
            <EditorPanel title="Profile basics" description="These fields power the main intro and contact block.">
              <AdminInput label="Preferred job title" value={portfolio.profile.title} onChange={(value) => updateProfile("title", value)} />
              <AdminTextarea label="Intro text" value={portfolio.profile.summary} onChange={(value) => updateProfile("summary", value)} />
              <div className="admin-editor-row admin-editor-row-2">
                <AdminInput label="Location" value={portfolio.profile.location} onChange={(value) => updateProfile("location", value)} />
                <AdminInput label="Email" value={portfolio.profile.email} onChange={(value) => updateProfile("email", value)} />
              </div>
              <AdminInput label="GitHub username" value={portfolio.profile.githubUser} onChange={(value) => updateProfile("githubUser", value)} />
            </EditorPanel>

            <EditorPanel title="Homepage showcase" description="Pick the compact highlights visitors should see first.">
              <div className="admin-showcase-grid">
                <Checklist title="Projects" values={portfolio.projects.map((project) => project.title)} selected={portfolio.home?.projectTitles || []} onToggle={toggleFeaturedProject} />
                <Checklist
                  title="Certifications"
                  values={portfolio.certifications.map((certification) => certification.name)}
                  selected={portfolio.home?.certificationNames || []}
                  onToggle={toggleFeaturedCertification}
                />
                <Checklist title="Stack" values={stackItems} selected={portfolio.home?.stackItems || []} onToggle={toggleFeaturedStack} />
              </div>
            </EditorPanel>
          </div>
        </AdminSectionLayout>
      );
    }

    if (activeSection === "links") {
      const linkStats = [
        { label: "Total links", value: portfolio.profile.socials.length },
        { label: "Ready links", value: portfolio.profile.socials.filter((social) => social.href.trim()).length },
        { label: "Unique labels", value: new Set(portfolio.profile.socials.map((social) => social.label.trim()).filter(Boolean)).size },
      ];

      return (
        <AdminSectionLayout details={sectionDetails.links} stats={linkStats}>
          <EditorPanel
            title="Link library"
            count={portfolio.profile.socials.length}
            description="Use clear labels and full URLs so the public buttons stay reliable."
            action={
              <button className="admin-compact-add-button" type="button" onClick={addSocial}>
                <PlusIcon className="h-4 w-4" />
                <span>Add link</span>
              </button>
            }
          >
            {portfolio.profile.socials.length === 0 ? <EmptyState label="No links yet. Add your first one." /> : null}
            <div className="admin-link-list">
              {portfolio.profile.socials.map((social, index) => (
                <div className="admin-link-row" key={`link-${index}`}>
                  <span className="admin-link-row-icon" aria-hidden="true">
                    <SocialIcon label={normalizeLinkLabel(social.label)} className="h-4 w-4" />
                  </span>
                  <label className="admin-field">
                    <span>Type</span>
                    <select value={normalizeLinkLabel(social.label)} onChange={(event) => updateSocial(index, "label", event.target.value)}>
                      {linkOptions.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <AdminInput label="URL" value={social.href} onChange={(value) => updateSocial(index, "href", value)} />
                  <button className="admin-icon-button" type="button" aria-label={`Delete ${social.label || "link"}`} onClick={() => removeSocial(index)}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </EditorPanel>
        </AdminSectionLayout>
      );
    }

    if (activeSection === "projects") {
      return (
        <AdminProjectManager
          session={session}
          projects={portfolio.projects}
          onCreate={addProject}
          onUpdate={(index, project) => updateProject(index, project)}
          onRemove={removeProject}
        />
      );
    }

    if (activeSection === "certifications") {
      return (
        <AdminSectionLayout details={sectionDetails.certifications}>
          <AdminCertificationManager
            session={session}
            recipientName={portfolio.profile.name}
            certifications={portfolio.certifications}
            onCreate={addCertification}
            onUpdate={(index, certification) => updateCertification(index, certification)}
            onRemove={removeCertification}
          />
        </AdminSectionLayout>
      );
    }

    if (activeSection === "stack") {
      return (
        <GroupEditor
          details={sectionDetails.stack}
          groups={portfolio.stackGroups}
          itemLabel="technology"
          saveStatus={saveStatus}
          onAdd={() => setPortfolio((current) => ({ ...current, stackGroups: [...current.stackGroups, emptyGroup] }))}
          onRemove={(index) => removeGroup("stackGroups", index)}
          onUpdate={(index, patch) => updateGroup("stackGroups", index, patch)}
        />
      );
    }

    return (
      <GroupEditor
        details={sectionDetails.skills}
        groups={portfolio.skillGroups || []}
        itemLabel="skill"
        saveStatus={saveStatus}
        onAdd={() => setPortfolio((current) => ({ ...current, skillGroups: [...(current.skillGroups || []), emptyGroup] }))}
        onRemove={(index) => removeGroup("skillGroups", index)}
        onUpdate={(index, patch) => updateGroup("skillGroups", index, patch)}
      />
    );
  };

  return (
    <div className="admin-content-shell mx-auto max-w-6xl">
      {message ? <p className="admin-editor-message">{message}</p> : null}

      {renderContentSection()}
    </div>
  );
}

function AdminSectionLayout({
  details,
  stats,
  action,
  children,
}: {
  details: { eyebrow: string; title: string; description: string };
  stats?: { label: string; value: number }[];
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-section-shell">
      <header className="admin-section-header">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">{details.eyebrow}</p>
          <h2>{details.title}</h2>
          <p>{details.description}</p>
        </div>
        {action}
      </header>
      {stats?.length ? (
        <div className="admin-section-stats" aria-label={`${details.title} summary`}>
          {stats.map((stat) => (
            <article key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      ) : null}
      <div className="admin-section-body">{children}</div>
    </section>
  );
}

function EditorPanel({ title, description, count, action, children }: { title: string; description?: string; count?: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="admin-editor-panel">
      <div className="admin-editor-panel-heading">
        <div className="admin-editor-panel-title">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
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

function Checklist({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string, checked: boolean) => void }) {
  const availableValues = values.filter(Boolean);

  return (
    <div className="admin-checklist">
      <div className="admin-checklist-head">
        <h3>{title}</h3>
        <span>{selected.length}/{availableValues.length}</span>
      </div>
      <div>
        {availableValues.map((value) => (
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
  details,
  groups,
  itemLabel,
  saveStatus,
  onAdd,
  onRemove,
  onUpdate,
}: {
  details: { eyebrow: string; title: string; description: string };
  groups: StackGroup[];
  itemLabel: string;
  saveStatus: SaveStatus;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<StackGroup>) => void;
}) {
  const [itemDrafts, setItemDrafts] = useState<Record<number, string>>({});
  const totalItems = groups.reduce((total, group) => total + group.items.length, 0);
  const stats = [
    { label: "Categories", value: groups.length },
    { label: `${itemLabel}s`, value: totalItems },
    { label: "Complete groups", value: groups.filter((group) => group.category.trim() && group.items.length).length },
  ];
  const addItemToGroup = (index: number) => {
    const nextItem = (itemDrafts[index] || "").trim();

    if (!nextItem) {
      return;
    }

    const currentItems = groups[index]?.items || [];
    if (!currentItems.some((item) => item.toLowerCase() === nextItem.toLowerCase())) {
      onUpdate(index, { items: [...currentItems, nextItem] });
    }

    setItemDrafts((current) => ({ ...current, [index]: "" }));
  };
  const removeItemFromGroup = (groupIndex: number, itemToRemove: string) => {
    const currentItems = groups[groupIndex]?.items || [];
    onUpdate(groupIndex, { items: currentItems.filter((item) => item !== itemToRemove) });
  };

  return (
    <AdminSectionLayout
      details={details}
      stats={stats}
      action={
        <button className="admin-manager-add-button" type="button" onClick={onAdd}>
          <PlusIcon className="h-4 w-4" />
          <span>Add category</span>
        </button>
      }
    >
      <EditorPanel title={`${details.title} categories`} count={groups.length} description={`Keep each ${itemLabel} group short, scannable, and easy to edit.`}>
        {groups.length === 0 ? <EmptyState label="No categories yet. Add your first one." /> : null}
        <div className="admin-category-list">
          {groups.map((group, index) => (
            <div className="admin-category-card" key={`category-${index}`}>
              <div className="admin-editor-item-head">
                <span className="admin-editor-item-index">{group.category.trim() || `Category ${String(index + 1).padStart(2, "0")}`}</span>
                <div className="admin-category-actions">
                  {saveStatus !== "idle" ? <span className={`admin-category-save-status is-${saveStatus}`}>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save failed"}</span> : null}
                  <button className="admin-icon-button" type="button" aria-label="Delete category" onClick={() => onRemove(index)}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
              <AdminInput label="Category" value={group.category} onChange={(value) => onUpdate(index, { category: value })} />
              <div className="admin-chip-editor" aria-label={`${group.category || "Category"} ${itemLabel}s`}>
                {group.items.map((item) => (
                  <span className="admin-editable-chip" key={item}>
                    {item}
                    <button type="button" aria-label={`Remove ${item}`} onClick={() => removeItemFromGroup(index, item)}>
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={itemDrafts[index] || ""}
                  onChange={(event) => setItemDrafts((current) => ({ ...current, [index]: event.target.value }))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addItemToGroup(index);
                    }
                  }}
                  placeholder={`Add ${itemLabel}`}
                />
              </div>
            </div>
          ))}
        </div>
      </EditorPanel>
    </AdminSectionLayout>
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

function normalizeLinkLabel(label: string): LinkOption {
  if (label === "Twitter") {
    return "X";
  }

  if (label === "Website") {
    return "Portfolio";
  }

  return linkOptions.find((option) => option === label) || "Email";
}

function isContentSection(section: string | undefined): section is ContentSection {
  return contentSections.some((item) => item.value === section);
}
