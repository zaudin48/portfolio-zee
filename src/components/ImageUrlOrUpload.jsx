import { useState } from "react";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY;

// A text field for pasting an image URL, PLUS a file picker that uploads
// the photo to imgbb.com (free, no card required) and drops the
// resulting URL into the same field automatically. Either way, what
// actually gets saved to Firestore is just a URL string — same as
// before — this just gives you a second way to get one.
export default function ImageUrlOrUpload({ value, onChange, placeholder, inputClass }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMGBB_KEY) {
      setError("Photo upload isn't set up yet — paste a URL instead, or see README.md.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data?.data?.url) {
        onChange(data.data.url);
      } else {
        setError("Upload failed — try a URL instead.");
      }
    } catch {
      setError("Upload failed — try a URL instead.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        className={inputClass}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-xs hover:border-crimson hover:text-crimson">
          {uploading ? "Uploading..." : "Or upload a photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </div>
  );
}