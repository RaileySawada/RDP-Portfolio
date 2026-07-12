import type { AdminSession } from "./adminAuth";

type UploadImageResult =
  | {
      ok: true;
      url: string;
      publicId?: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function uploadAdminImage(session: AdminSession, file: File, folder: string): Promise<UploadImageResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Select an image file." };
  }

  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "Image must be under 4MB." };
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const response = await fetch("/.netlify/functions/admin-upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session, folder, file: dataUrl }),
    });
    const data = (await response.json()) as UploadImageResult;

    if (!response.ok && data && !data.ok) {
      return data;
    }

    return data;
  } catch {
    return {
      ok: false,
      error: "Upload service is unavailable.",
    };
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(new Error("Could not read image.")));
    reader.readAsDataURL(file);
  });
}
