import { useEffect, useState } from "react";
import type { Certification } from "../../data/portfolio";
import type { AdminSession } from "../../services/adminAuth";
import { uploadAdminImage } from "../../services/adminUpload";
import { CertificateCard } from "../portfolio/CertificateCard";
import { EditIcon, PlusIcon, TrashIcon } from "../ui/Icons";
import { AdminImagePicker } from "./AdminImagePicker";
import { AdminModal, ConfirmDeleteModal } from "./AdminModal";

type AdminCertificationManagerProps = {
  session: AdminSession;
  recipientName: string;
  certifications: Certification[];
  onCreate: (certification: Certification) => void;
  onUpdate: (index: number, certification: Certification) => void;
  onRemove: (index: number) => void;
};

const emptyCertification: Certification = {
  name: "",
  issuer: "",
  date: "",
  credential: "",
  imageUrl: "",
  details: "",
};

export function AdminCertificationManager({
  session,
  recipientName,
  certifications,
  onCreate,
  onUpdate,
  onRemove,
}: AdminCertificationManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const editingCertification = editingIndex !== null ? certifications[editingIndex] : null;
  const certificatesWithCredentials = certifications.filter((certification) => certification.credential?.trim()).length;
  const certificatesWithImages = certifications.filter((certification) => certification.imageUrl?.trim()).length;

  return (
    <section className="admin-manager admin-manager-certifications">
      <div className="admin-manager-head">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Content · Certifications</p>
          <h2>Certifications</h2>
          <p className="admin-manager-subtext">
            {certifications.length} {certifications.length === 1 ? "certificate" : "certificates"} · shown exactly as they appear on the live Certifications page
          </p>
        </div>
        <button className="admin-manager-add-button" type="button" onClick={() => setIsCreating(true)}>
          <PlusIcon className="h-4 w-4" />
          <span>Add certification</span>
        </button>
      </div>

      <div className="admin-manager-summary" aria-label="Certification content summary">
        <SummaryItem label="Live cards" value={certifications.length} />
        <SummaryItem label="Verify links" value={certificatesWithCredentials} />
        <SummaryItem label="Images saved" value={certificatesWithImages} />
      </div>

      {certifications.length === 0 ? (
        <div className="admin-editor-empty admin-manager-empty">
          <p>No certifications yet. Add your first one to publish it on the live Certifications page.</p>
          <button className="admin-manager-add-button" type="button" onClick={() => setIsCreating(true)}>
            <PlusIcon className="h-4 w-4" />
            <span>Add certification</span>
          </button>
        </div>
      ) : (
        <div className="admin-manager-grid admin-manager-grid-certificates">
          {certifications.map((certification, index) => (
            <div className="admin-manager-card admin-certification-card" key={`${certification.name}-${index}`}>
              <div className="admin-manager-card-actions">
                <button className="admin-manager-icon-button" type="button" aria-label={`Edit ${certification.name || "certification"}`} onClick={() => setEditingIndex(index)}>
                  <EditIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  className="admin-manager-icon-button admin-manager-icon-button-danger"
                  type="button"
                  aria-label={`Delete ${certification.name || "certification"}`}
                  onClick={() => setDeleteIndex(index)}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="admin-manager-card-preview">
                <CertificateCard certification={certification} recipientName={recipientName} index={index} />
              </div>
            </div>
          ))}
        </div>
      )}

      <CertificationFormModal
        key="create-certification"
        isOpen={isCreating}
        title="Add certification"
        session={session}
        recipientName={recipientName}
        initialCertification={emptyCertification}
        onClose={() => setIsCreating(false)}
        onSubmit={(certification) => {
          onCreate(certification);
          setIsCreating(false);
        }}
      />

      <CertificationFormModal
        key={`edit-certification-${editingIndex}`}
        isOpen={editingIndex !== null}
        title="Edit certification"
        session={session}
        recipientName={recipientName}
        initialCertification={editingCertification || emptyCertification}
        onClose={() => setEditingIndex(null)}
        onSubmit={(certification) => {
          if (editingIndex !== null) {
            onUpdate(editingIndex, certification);
          }
          setEditingIndex(null);
        }}
      />

      <ConfirmDeleteModal
        isOpen={deleteIndex !== null}
        title="Delete certification"
        description={`Remove "${deleteIndex !== null ? certifications[deleteIndex]?.name || "this certification" : ""}" from your portfolio? This can't be undone once you save.`}
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

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <article>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function CertificationFormModal({
  isOpen,
  title,
  session,
  recipientName,
  initialCertification,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  title: string;
  session: AdminSession;
  recipientName: string;
  initialCertification: Certification;
  onClose: () => void;
  onSubmit: (certification: Certification) => void;
}) {
  const [draft, setDraft] = useState<Certification>(initialCertification);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDraft(initialCertification);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const patch = (next: Partial<Certification>) => setDraft((current) => ({ ...current, ...next }));

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setError("");
    const result = await uploadAdminImage(session, file, "portfolio/certifications");
    setIsUploading(false);
    if (result.ok) {
      patch({ imageUrl: result.url });
    } else {
      setError(result.error);
    }
  };

  const handleSubmit = () => {
    if (!draft.name.trim()) {
      setError("Name is required.");
      return;
    }
    onSubmit({ ...draft, name: draft.name.trim() });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      title={title}
      eyebrow="Certification"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="admin-modal-button-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-modal-button-primary" type="button" disabled={isUploading} onClick={handleSubmit}>
            {isUploading ? "Uploading image..." : "Save certification"}
          </button>
        </>
      }
    >
      {error ? <p className="admin-modal-error">{error}</p> : null}
      <div className="admin-modal-edit-layout">
        <div className="admin-modal-preview admin-modal-preview-certificate admin-modal-sticky-preview">
          <CertificateCard certification={draft} recipientName={recipientName} />
        </div>
        <div className="admin-modal-form-stack">
          <div className="admin-editor-row admin-editor-row-2">
            <div className="admin-field">
              <span>Name</span>
              <input value={draft.name} onChange={(event) => patch({ name: event.target.value })} placeholder="Certification name" />
            </div>
            <div className="admin-field">
              <span>Date</span>
              <input value={draft.date} onChange={(event) => patch({ date: event.target.value })} placeholder="2026/01" />
            </div>
          </div>
          <div className="admin-field">
            <span>Issuer</span>
            <input value={draft.issuer} onChange={(event) => patch({ issuer: event.target.value })} placeholder="Issuing organization" />
          </div>
          <div className="admin-field">
            <span>Credential link</span>
            <input value={draft.credential || ""} onChange={(event) => patch({ credential: event.target.value })} placeholder="https://..." />
          </div>
          <AdminImagePicker
            label="Certificate image URL"
            value={draft.imageUrl || ""}
            isUploading={isUploading}
            onChange={(imageUrl) => patch({ imageUrl })}
            onUpload={handleUpload}
          />
          <div className="admin-field">
            <span>Details</span>
            <textarea rows={3} value={draft.details || ""} onChange={(event) => patch({ details: event.target.value })} placeholder="Optional extra detail" />
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
