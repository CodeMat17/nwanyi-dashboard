"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Compressor from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";

export default function GalleryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const addImage = useMutation(api.gallery.addImage);
  const deleteImage = useMutation(api.gallery.deleteImage);
  const images = useQuery(api.gallery.getAll);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    try {
      setIsUploading(true);
      setCompressionProgress(0);

      // Compress the image
      const options = {
        maxSizeMB: 0.2, // 200KB max
        maxWidthOrHeight: 1020, // 1020px max dimension
        useWebWorker: true,
        onProgress: (progress: number) => setCompressionProgress(progress),
      };

      const compressedFile = await Compressor(file, options);

      // Check final size
      if (compressedFile.size > 200 * 1024) {
        throw new Error("Compressed image is still too large (>200KB)");
      }

      // Get upload URL
      const postUrl = await generateUploadUrl();

      // Upload the file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": compressedFile.type },
        body: compressedFile,
      });
      const { storageId } = await result.json();

      // Add to gallery
      await addImage({ imageId: storageId });

      toast.success("Image uploaded successfully");
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setCompressionProgress(0);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteImage({ imageId: imageId as Id<"_storage"> });
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Upload Image</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-4'>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              disabled={isUploading}
              className='hidden'
              id='gallery-upload'
            />
            <label
              htmlFor='gallery-upload'
              className={`px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {file ? file.name : "Select Image"}
            </label>
            <Button onClick={handleUpload} disabled={isUploading || !file}>
              {isUploading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Upload
                </>
              )}
            </Button>
          </div>

          {isUploading && (
            <div className='space-y-1'>
              <p className='text-sm font-medium'>
                {compressionProgress < 100 ? "Compressing..." : "Uploading..."}
              </p>
              <div className='h-2 w-full bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-primary transition-all duration-300'
                  style={{ width: `${compressionProgress}%` }}
                />
              </div>
            </div>
          )}

          <p className='text-sm text-muted-foreground'>
            Max 200KB, will be resized to 1020px width/height
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {images?.length === 0 ? (
            <p className='text-center text-gray-500 py-8'>
              No images uploaded yet
            </p>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
              {images?.map((image) => (
                <div
                  key={image._id}
                  className='group relative rounded-lg overflow-hidden aspect-square'>
                  <Image
                    src={image.image}
                    alt='Gallery image'
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                  <div className='absolute inset-0 bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleDelete(image.imageId)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
