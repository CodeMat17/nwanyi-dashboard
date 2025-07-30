"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function AddCarouselPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressionError, setCompressionError] = useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const addCarouselItem = useMutation(api.carousel.addCarousel);

  const compressionOptions = {
    maxSizeMB: 0.2, // 200KB (ideal for fast loading)
    maxWidthOrHeight: 1200, // Resizes to 1200px width/height
    fileType: "image/webp", // Converts to WebP (smaller than JPEG/PNG)
    initialQuality: 0.8, // 80% quality (visually good)
    useWebWorker: true, // Faster processing
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressionError(false);
      const compressedFile = await imageCompression(file, compressionOptions);
      setSelectedFile(compressedFile);

      // Create preview URL from compressed file
      const url = await imageCompression.getDataUrlFromFile(compressedFile);
      setPreviewUrl(url);

      toast.info("Image optimized for web (reduced to 200KB)");
    } catch (error) {
      setCompressionError(true);
      toast.error("Failed to compress image");
      console.error("Compression error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !title || !tag) {
      toast.error("Failed!", {
        description: "Please fill all fields and select an image",
      });
      return;
    }

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();

      await addCarouselItem({
        imageId: storageId,
        title,
        tag,
      });

      toast.success("Success", {
        description: "Carousel item added successfully",
      });

      setSelectedFile(null);
      setTitle("");
      setTag("");
      setPreviewUrl(null);
      router.refresh();
    } catch (error) {
      toast.error("Error", {
        description: "Failed to upload carousel item",
      });
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='min-h-screen container mx-auto p-2'>
      <div className='max-w-2xl mx-auto'>
        <Button asChild>
          <Link href='/admin/carousel'>Go Back</Link>
        </Button>
      </div>
      <Card className='max-w-2xl mt-8 mx-auto'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Add Carousel Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          {compressionError && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Compression failed</AlertTitle>
              <AlertDescription>
                Could not optimize the image. Try a different file.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='image'>Image</Label>
              <Input
                id='image'
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                disabled={isUploading}
                className='cursor-pointer'
              />
              {previewUrl && (
                <div className='mt-4'>
                  <p className='text-sm font-medium mb-2'>
                    Preview (compressed):
                  </p>
                  <div className='border rounded-md overflow-hidden max-w-xs relative aspect-video'>
                    <Image
                      src={previewUrl}
                      alt='Preview'
                      fill
                      className='object-cover'
                      onLoad={() => URL.revokeObjectURL(previewUrl)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='title'>Title (max 50 characters)</Label>
              <Input
                id='title'
                type='text'
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    setTitle(e.target.value);
                  }
                }}
                disabled={isUploading}
                placeholder='Enter title (max 50 characters)'
                maxLength={50}
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{title.length}/50 characters</span>
                {title.length === 50 && (
                  <span className='text-red-500'>Maximum reached</span>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='tag'>
                Tag (max 2 words eg. Excellence, Honour, Cultural Heritage)
              </Label>
              <Input
                id='tag'
                value={tag}
                onChange={(e) => {
                  const value = e.target.value;
                  // Count words and limit to 2
                  const wordCount = value.trim().split(/\s+/).length;
                  if (wordCount <= 2 || value.length < tag.length) {
                    setTag(value);
                  }
                }}
                placeholder='Enter tag (max 2 words)'
                disabled={isUploading}
              />
              {tag.trim().split(/\s+/).length > 2 && (
                <p className='text-sm text-red-500'>Maximum 2 words allowed</p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={isUploading || !selectedFile || !title || !tag}>
              {isUploading ? "Uploading..." : "Add Carousel Item"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
