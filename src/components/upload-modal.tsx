"use client";

import { useState, useRef } from "react";
import { Upload, X, FileAudio, Loader2 } from "lucide-react";

export function UploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    try {
      // 1. Get presigned URL (includes R2 free tier check)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          title: title || undefined,
          fileSize: file.size,
        }),
      });
      const uploadData = await res.json();
      if (uploadData.error === "free_tier_limit") {
        setWarning(uploadData.message);
        setUploading(false);
        return;
      }
      const { uploadUrl, episodeId, key } = uploadData;

      // 2. Upload directly to R2
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      // 3. Confirm upload (includes Inngest/Deepgram free tier check)
      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId,
          key,
          fileSize: file.size,
        }),
      });
      const confirmData = await confirmRes.json();
      if (confirmData.warning?.requiresApproval) {
        setWarning(confirmData.warning.message);
      }

      setUploading(false);
      setFile(null);
      setTitle("");
      setProgress(0);
      if (!confirmData.warning?.requiresApproval) {
        onClose();
      }
      window.location.reload();
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-high border border-outline/20 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text"
        >
          <X size={18} />
        </button>

        <h2 className="font-display text-2xl font-bold mb-6">
          Upload Episode
        </h2>

        {/* Title input */}
        <div className="mb-4">
          <label className="label-md text-text-muted block mb-2">
            Episode Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Podcast Episode"
            className="w-full bg-black border-none rounded-lg py-3 px-4 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* File picker */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-outline/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors mb-6"
        >
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileAudio size={24} className="text-primary" />
              <div className="text-left">
                <p className="text-sm font-bold text-text">{file.name}</p>
                <p className="text-xs text-text-muted">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">
                Click to select audio or video file
              </p>
              <p className="text-xs text-text-muted/60 mt-1">
                MP3, MP4, WAV, M4A, MOV up to 2GB
              </p>
            </>
          )}
        </div>

        {/* Free tier warning */}
        {warning && (
          <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl">
            <p className="text-sm text-warning font-medium">{warning}</p>
            <p className="text-xs text-text-muted mt-2">
              Upload saved but processing paused. Upgrade your plan or wait for the next billing cycle.
            </p>
          </div>
        )}

        {/* Progress bar */}
        {uploading && (
          <div className="mb-6">
            <div className="w-full h-2 bg-surface-highest rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-text-muted mt-2 text-center">
              Uploading... {progress}%
            </p>
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full gradient-primary text-background font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Upload size={18} />
          )}
          {uploading ? "Uploading..." : "Upload Episode"}
        </button>
      </div>
    </div>
  );
}
