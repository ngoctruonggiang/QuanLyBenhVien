"use client";

import React, { useState, useRef } from "react";
import { Upload, Trash2, Loader2, Camera, X } from "lucide-react";
import { UserAvatar } from "./user-avatar";
import { toast } from "sonner";
import { processAvatarImage, validateImageFile } from "@/lib/image-utils";

interface AvatarUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  loading?: boolean;
  userName?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  size = "lg",
  editable = true,
  loading: externalLoading = false,
  userName,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = externalLoading || uploading || deleting;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setUploading(true);
      toast.loading("Đang xử lý ảnh...", { id: "processing" });
      
      // Process image (crop and compress)
      const processedFile = await processAvatarImage(file);
      
      toast.dismiss("processing");
      toast.loading("Đang upload...", { id: "uploading" });
      
      await onUpload(processedFile);
      
      toast.dismiss("uploading");
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss("processing");
      toast.dismiss("uploading");
      toast.error("Không thể upload ảnh");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setDeleting(true);
      await onDelete();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Không thể xóa ảnh");
    } finally {
      setDeleting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setUploading(true);
      toast.loading("Đang xử lý ảnh...", { id: "processing" });
      
      // Process image (crop and compress)
      const processedFile = await processAvatarImage(file);
      
      toast.dismiss("processing");
      toast.loading("Đang upload...", { id: "uploading" });
      
      await onUpload(processedFile);
      
      toast.dismiss("uploading");
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss("processing");
      toast.dismiss("uploading");
      toast.error("Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar with upload overlay */}
      <div
        className={`relative group ${!editable ? "cursor-default" : "cursor-pointer"}`}
        onDragEnter={editable ? handleDrag : undefined}
        onDragLeave={editable ? handleDrag : undefined}
        onDragOver={editable ? handleDrag : undefined}
        onDrop={editable ? handleDrop : undefined}
        onClick={editable && !loading ? () => fileInputRef.current?.click() : undefined}
      >
        <UserAvatar
          imageUrl={currentImageUrl}
          userName={userName}
          size={size}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Hover overlay (only if editable and not loading) */}
        {editable && !loading && (
          <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${dragActive ? "opacity-100 bg-black/60" : ""}`}>
            <Camera className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Hidden file input */}
        {editable && (
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        )}
      </div>

      {/* Action buttons */}
      {editable && !loading && (
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-sm inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {currentImageUrl ? "Đổi ảnh" : "Upload ảnh"}
          </button>

          {currentImageUrl && onDelete && (
            <button
              onClick={handleDelete}
              className="btn-outline-icon text-red-600 hover:bg-red-50"
              title="Xóa ảnh"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Help text */}
      {editable && !loading && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center max-w-xs">
          Kéo thả hoặc click để upload
          <br />
          JPG, PNG, WEBP • Tối đa 5MB
        </p>
      )}
    </div>
  );
}
