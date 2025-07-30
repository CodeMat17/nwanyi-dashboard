// components/ImageUploader.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import Compressor from "browser-image-compression";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageChange: (file: File) => void;
  maxSizeMB?: number;
  maxDimension?: number;
  disabled?: boolean;
  initialImageUrl?: string | null;
}

export function ImageUploader({
  onImageChange,
  maxSizeMB = 0.2,
  maxDimension = 720,
  disabled = false,
  initialImageUrl = null,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial image if provided
  useEffect(() => {
    if (initialImageUrl) {
      setPreview(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setProgress(0);

      const compressedFile = await Compressor(file, {
        maxSizeMB,
        maxWidthOrHeight: maxDimension,
        useWebWorker: true,
        onProgress: (p) => setProgress(p),
      });

      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
      onImageChange(compressedFile);
    } catch (error) {
      console.error(error);
      resetFileInput();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    resetFileInput();
    onImageChange(null as unknown as File); // Pass null to parent
  };

  return (
    <div className='space-y-4'>
      <input
        type='file'
        accept='image/*'
        onChange={handleChange}
        ref={fileInputRef}
        disabled={disabled || isLoading}
        className='hidden'
        id='image-upload'
      />

      <div className='flex items-center gap-4'>
        <label
          htmlFor='image-upload'
          className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            disabled || isLoading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          }`}>
          {isLoading ? "Processing..." : "Upload Image"}
        </label>

        {preview && (
          <Button
            type='button'
            variant='outline'
            onClick={handleRemove}
            disabled={isLoading}>
            Remove
          </Button>
        )}
      </div>

      {isLoading && (
        <div className='w-full space-y-1'>
          <p className='text-sm text-muted-foreground'>
            Compressing image ({progress.toFixed(0)}%)
          </p>
          <div className='h-2 w-full overflow-hidden rounded-full bg-secondary'>
            <div
              className='h-full bg-primary transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {preview && (
        <div className='relative mt-4 aspect-video w-full overflow-hidden rounded-md border'>
          <Image
            src={preview}
            alt='Preview'
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px'
            priority={false}
          />
        </div>
      )}

      <p className='text-sm text-muted-foreground'>
        Max {maxSizeMB}MB, will be resized to {maxDimension}px width/height
      </p>
    </div>
  );
}
