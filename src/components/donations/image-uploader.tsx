"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { uploadDonationImageAction } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploader({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Images must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadDonationImageAction(formData);
    setUploading(false);
    URL.revokeObjectURL(localPreview);

    if (!result.ok) {
      setPreview(value);
      setError(result.message);
      return;
    }

    setPreview(result.url);
    onChange(result.url);
  }

  function remove() {
    setPreview(undefined);
    setError(null);
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "rounded-card border border-dashed bg-canvas p-3 transition-colors",
          dragging ? "border-green bg-green-light/40" : "border-line",
        )}
      >
        {preview ? (
          <div className="relative overflow-hidden rounded-control border border-line bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Donation preview"
              className="h-44 w-full object-cover"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1.5">
              {uploading && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-2 py-1 text-[10.5px] text-secondary shadow-pop">
                  <Loader2 className="size-3 animate-spin" strokeWidth={2} />
                  Uploading
                </span>
              )}
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={remove}
                aria-label="Remove image"
                className="bg-paper/95"
                disabled={uploading}
              >
                <X className="size-3.5" strokeWidth={2} />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-control px-4 py-8 text-center transition-colors hover:bg-surface"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-paper text-muted">
              <UploadCloud className="size-[18px]" strokeWidth={1.7} />
            </span>
            <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
              <ImagePlus className="size-3.5" strokeWidth={1.8} />
              Upload a photo
            </span>
            <span className="text-[11px] text-muted">
              Drag and drop, or choose a file. JPG, PNG or WebP up to 5 MB.
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-[12px] leading-5 text-ink-soft" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
