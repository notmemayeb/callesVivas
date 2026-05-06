"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaUploadProps {
  incidentId: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
}

interface UploadedFile {
  id: string;
  url: string;
  type: string;
}

export function MediaUpload({
  incidentId,
  onUploadComplete,
  maxFiles = 5,
}: MediaUploadProps) {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    for (const file of files.slice(0, maxFiles - uploads.length)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("incidentId", incidentId);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const { media } = await res.json();
          setUploads((prev) => [
            ...prev,
            { id: media.id, url: media.url, type: media.type },
          ]);
        }
      } catch {
        // silently skip failed uploads
      }
    }

    setIsUploading(false);
    onUploadComplete?.();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {uploads.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {uploads.map((file) => (
            <div key={file.id} className="relative w-20 h-20">
              {file.type === "PHOTO" ? (
                <img
                  src={file.url}
                  alt=""
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  {file.type}
                </div>
              )}
              <button
                onClick={() =>
                  setUploads((prev) => prev.filter((f) => f.id !== file.id))
                }
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploads.length < maxFiles && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Camera size={14} />
            )}
            {isUploading ? "Subiendo..." : "Añadir fotos"}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            {uploads.length}/{maxFiles} archivos
          </p>
        </div>
      )}
    </div>
  );
}
