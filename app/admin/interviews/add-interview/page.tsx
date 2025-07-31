"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RichTextEditor } from "@/app/admin/components/RichTextEditor";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import imageCompression from "browser-image-compression";
import { useMutation } from "convex/react";
import DOMPurify from "isomorphic-dompurify";
import { AlertCircle, ChevronDownIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";

const AddInterviewPage = () => {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createInterview = useMutation(api.interviews.createInterview);

  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressionError, setCompressionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    title: "",
    category: "",
    excerpt: "",
    date: new Date(),
    content: "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressionError(false);
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1200,
        fileType: "image/webp",
        initialQuality: 0.8,
        useWebWorker: true,
      });
      setSelectedFile(compressedFile);
      const url = await imageCompression.getDataUrlFromFile(compressedFile);
      setPreviewUrl(url);
      toast.info("Image optimized for web (reduced to 200KB)");
    } catch (error) {
      setCompressionError(true);
      toast.error("Failed to compress image");
      console.error("Compression error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !selectedFile ||
      !formData.name ||
      !formData.position ||
      !formData.title ||
      !formData.category ||
      !formData.excerpt
    ) {
      toast.error("Please fill all required fields and select an image");
      setIsSubmitting(false);
      return;
    }

    try {
      // Sanitize the HTML content
      DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        if (node.tagName === "IMG") {
          node.setAttribute("referrerpolicy", "no-referrer");
        }
      });
      const sanitizedContent = DOMPurify.sanitize(formData.content, {
        ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ul", "ol", "li", "img"],
        ALLOWED_ATTR: ["src", "class", "alt"],
      });

      // Upload the interviewee photo
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();
      const imageId = storageId as Id<"_storage">;

      await createInterview({
        name: formData.name,
        position: formData.position,
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt,
        imageId,
        date: formData.date.toISOString(),
        content: sanitizedContent,
      });

      toast.success("Interview created successfully!");
      router.push("/admin/interviews");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create interview"
      );
      console.error("Error creating interview:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen p-4 sm:p-6 lg:p-8'>
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8 text-center'>
          Add New Interview
        </h1>
        <form
          onSubmit={handleSubmit}
          className='space-y-6  bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg'>
          <section className='space-y-6'>
            <h2 className='text-xl font-semibold border-b pb-2'>
              Basic Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='name' className='text-muted-foreground'>
                  Name of Interviewee
                </Label>
                <Input
                  id='name'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Enter interviewee name'
                  required
                  className='w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='position' className='text-muted-foreground'>
                  Position
                </Label>
                <Input
                  id='position'
                  name='position'
                  value={formData.position}
                  onChange={handleChange}
                  placeholder='Enter position'
                  required
                  className='w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='title' className='text-muted-foreground'>
                  Interview Title
                </Label>
                <Input
                  id='title'
                  name='title'
                  value={formData.title}
                  onChange={handleChange}
                  placeholder='Enter interview title'
                  required
                  className='w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='category' className='text-muted-foreground'>
                  Category
                </Label>
                <Input
                  id='category'
                  name='category'
                  value={formData.category}
                  onChange={handleChange}
                  placeholder='e.g., Business, Culture'
                  required
                  className='w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-muted-foreground'>Interview Date</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-between font-normal border-gray-300 rounded-md hover:bg-gray-50'>
                      {formData.date
                        ? dayjs(formData.date).format("MMM DD, YYYY")
                        : "Select date"}
                      <ChevronDownIcon className='ml-2 h-4 w-4 text-gray-500' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={formData.date}
                      onSelect={(date) =>
                        date && setFormData((prev) => ({ ...prev, date }))
                      }
                      initialFocus
                      className='border-none'
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='excerpt' className='text-muted-foreground'>
                Excerpt
              </Label>
              <Input
                id='excerpt'
                name='excerpt'
                value={formData.excerpt}
                onChange={handleChange}
                placeholder='Enter short excerpt'
                required
                className='w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-muted-foreground'>Interviewee Photo</Label>
              {compressionError && (
                <Alert variant='destructive' className='mb-4'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Compression failed</AlertTitle>
                  <AlertDescription>
                    Could not optimize the image. Try a different file.
                  </AlertDescription>
                </Alert>
              )}
              <Input
                id='image'
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                disabled={isSubmitting}
                className='w-full cursor-pointer border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
              />
              {previewUrl && (
                <div className='mt-4'>
                  <p className='text-sm font-medium text-gray-600 mb-2'>
                    Preview:
                  </p>
                  <div className='border border-gray-200 rounded-md overflow-hidden max-w-[150px] relative aspect-square'>
                    <Image
                      src={previewUrl}
                      alt='Preview'
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, 50vw'
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
          <section className='space-y-6'>
            <h2 className='text-xl font-semibold border-b pb-2'>
              Interview Content
            </h2>
            <div className='space-y-2'>
              <Label className='text-muted-foreground'>Full Content</Label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
              />
            </div>
          </section>
          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push("/admin/interviews")}
              disabled={isSubmitting}
              className='border-gray-300 hover:bg-gray-50'>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-blue-600 hover:bg-blue-700 text-white'>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                "Save Interview"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInterviewPage;
