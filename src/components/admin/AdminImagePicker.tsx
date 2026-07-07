import { ImageIcon, TrashIcon, UploadIcon } from "../ui/Icons";

type AdminImagePickerProps = {
  label: string;
  value: string;
  isUploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File | undefined) => void;
};

export function AdminImagePicker({ label, value, isUploading, onChange, onUpload }: AdminImagePickerProps) {
  return (
    <div className="admin-image-picker">
      <div className="admin-image-preview">
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className="admin-image-placeholder">
            <ImageIcon className="h-6 w-6" />
          </span>
        )}
      </div>

      <div className="admin-image-main">
        <label className="admin-field admin-image-url-field">
          <span>{label}</span>
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." />
        </label>

        <div className="admin-image-actions">
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
    </div>
  );
}
