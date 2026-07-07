import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "../ui/Icons";

type AdminModalProps = {
  isOpen: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

export function AdminModal({ isOpen, title, eyebrow, onClose, children, footer, size = "md" }: AdminModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className={`admin-modal-panel admin-modal-panel-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-head">
          <div>
            {eyebrow ? <p className="metadata text-neutral-500 dark:text-neutral-500">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <button className="admin-modal-close" type="button" aria-label="Close" onClick={onClose}>
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer ? <div className="admin-modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteModal({ isOpen, title, description, isBusy, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      title={title}
      eyebrow="Confirm delete"
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <button className="admin-modal-button-ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="admin-modal-button-danger" type="button" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? <span className="admin-spinner" aria-hidden="true" /> : null}
            <span>{isBusy ? "Deleting..." : "Delete"}</span>
          </button>
        </>
      }
    >
      <p className="admin-modal-confirm-text">{description}</p>
    </AdminModal>
  );
}
