import { useEffect, useState } from "react";
import type { Project, ProjectIconKey } from "../../data/portfolio";
import type { AdminSession } from "../../services/adminAuth";
import { uploadAdminImage } from "../../services/adminUpload";
import { ProjectCard } from "../portfolio/ProjectCard";
import { EditIcon, PlusIcon, TrashIcon } from "../ui/Icons";
import { AdminImagePicker } from "./AdminImagePicker";
import { AdminModal, ConfirmDeleteModal } from "./AdminModal";

type AdminProjectManagerProps = {
  session: AdminSession;
  projects: Project[];
  onCreate: (project: Project) => void;
  onUpdate: (index: number, project: Project) => void;
  onRemove: (index: number) => void;
};

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

export function AdminProjectManager({ session, projects, onCreate, onUpdate, onRemove }: AdminProjectManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const editingProject = editingIndex !== null ? projects[editingIndex] : null;

  return (
    <section className="admin-manager">
      <div className="admin-manager-head">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Content · Projects</p>
          <h2>Projects</h2>
          <p className="admin-manager-subtext">
            {projects.length} {projects.length === 1 ? "project" : "projects"} · shown exactly as they appear on the live Projects page
          </p>
        </div>
        <button className="admin-manager-add-button" type="button" onClick={() => setIsCreating(true)}>
          <PlusIcon className="h-4 w-4" />
          <span>Add project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="admin-editor-empty">No projects yet. Add your first one.</p>
      ) : (
        <div className="admin-manager-grid">
          {projects.map((project, index) => (
            <div className="admin-manager-card" key={`${project.title}-${index}`}>
              <div className="admin-manager-card-actions">
                <button className="admin-manager-icon-button" type="button" aria-label={`Edit ${project.title || "project"}`} onClick={() => setEditingIndex(index)}>
                  <EditIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  className="admin-manager-icon-button admin-manager-icon-button-danger"
                  type="button"
                  aria-label={`Delete ${project.title || "project"}`}
                  onClick={() => setDeleteIndex(index)}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="admin-manager-card-preview">
                <ProjectCard project={project} index={index} />
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectFormModal
        key="create-project"
        isOpen={isCreating}
        title="Add project"
        session={session}
        initialProject={emptyProject}
        onClose={() => setIsCreating(false)}
        onSubmit={(project) => {
          onCreate(project);
          setIsCreating(false);
        }}
      />

      <ProjectFormModal
        key={`edit-project-${editingIndex}`}
        isOpen={editingIndex !== null}
        title="Edit project"
        session={session}
        initialProject={editingProject || emptyProject}
        onClose={() => setEditingIndex(null)}
        onSubmit={(project) => {
          if (editingIndex !== null) {
            onUpdate(editingIndex, project);
          }
          setEditingIndex(null);
        }}
      />

      <ConfirmDeleteModal
        isOpen={deleteIndex !== null}
        title="Delete project"
        description={`Remove "${deleteIndex !== null ? projects[deleteIndex]?.title || "this project" : ""}" from your portfolio? This can't be undone once you save.`}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex !== null) {
            onRemove(deleteIndex);
          }
          setDeleteIndex(null);
        }}
      />
    </section>
  );
}

function ProjectFormModal({
  isOpen,
  title,
  session,
  initialProject,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  title: string;
  session: AdminSession;
  initialProject: Project;
  onClose: () => void;
  onSubmit: (project: Project) => void;
}) {
  const [draft, setDraft] = useState<Project>(initialProject);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDraft(initialProject);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const patch = (next: Partial<Project>) => setDraft((current) => ({ ...current, ...next }));

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setError("");
    const result = await uploadAdminImage(session, file, "portfolio/projects");
    setIsUploading(false);
    if (result.ok) {
      patch({ imageUrl: result.url });
    } else {
      setError(result.error);
    }
  };

  const handleSubmit = () => {
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    onSubmit({ ...draft, title: draft.title.trim() });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      title={title}
      eyebrow="Project"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="admin-modal-button-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-modal-button-primary" type="button" disabled={isUploading} onClick={handleSubmit}>
            {isUploading ? "Uploading image..." : "Save project"}
          </button>
        </>
      }
    >
      {error ? <p className="admin-modal-error">{error}</p> : null}
      <div className="admin-modal-edit-layout">
        <div className="admin-modal-preview admin-modal-sticky-preview">
          <ProjectCard project={draft} />
        </div>
        <div className="admin-modal-form-stack">
          <label className="admin-field">
            <span>Title</span>
            <input value={draft.title} onChange={(event) => patch({ title: event.target.value })} placeholder="Project name" />
          </label>
          <label className="admin-field">
            <span>Description</span>
            <textarea rows={4} value={draft.description} onChange={(event) => patch({ description: event.target.value })} placeholder="What the project does" />
          </label>
          <div className="admin-editor-row admin-editor-row-2">
            <label className="admin-field">
              <span>Status</span>
              <input value={draft.status} onChange={(event) => patch({ status: event.target.value })} placeholder="e.g. Capstone" />
            </label>
            <label className="admin-field">
              <span>Icon</span>
              <select value={draft.icon || "web"} onChange={(event) => patch({ icon: event.target.value as ProjectIconKey })}>
                {projectIcons.map((icon) => (
                  <option value={icon} key={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="admin-editor-row admin-editor-row-2">
            <label className="admin-field">
              <span>GitHub</span>
              <input value={draft.github} onChange={(event) => patch({ github: event.target.value })} placeholder="https://github.com/..." />
            </label>
            <label className="admin-field">
              <span>Demo / npm / deployment</span>
              <input value={draft.demo || ""} onChange={(event) => patch({ demo: event.target.value })} placeholder="https://..." />
            </label>
          </div>
          <AdminImagePicker
            label="Project image URL"
            value={draft.imageUrl || ""}
            isUploading={isUploading}
            onChange={(imageUrl) => patch({ imageUrl })}
            onUpload={handleUpload}
          />
          <label className="admin-field">
            <span>Tech, one per line</span>
            <textarea
              rows={4}
              value={draft.tech.join("\n")}
              onChange={(event) =>
                patch({
                  tech: event.target.value
                    .split(/\n|,/)
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              placeholder="React&#10;TypeScript"
            />
          </label>
        </div>
      </div>
    </AdminModal>
  );
}
