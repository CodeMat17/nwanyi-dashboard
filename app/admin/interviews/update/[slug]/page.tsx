"use client";

import { RichTextEditor } from "@/app/admin/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import imageCompression from "browser-image-compression";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UpdateInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const slugParam = params.slug as string;

  const interview = useQuery(api.interviews.getInterviewBySlug, {
    slug: slugParam,
  });
  const updateInterview = useMutation(api.interviews.updateInterview);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  useEffect(() => {
    if (interview) {
      setFormData({
        name: interview.name || "",
        position: interview.position || "",
        title: interview.title || "",
        category: interview.category || "",
        excerpt: interview.excerpt || "",
        date: new Date(interview.date || new Date()),
        content: interview.content || "",
      });
      if (interview.image) setPreviewUrl(interview.image);
    }
  }, [interview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
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

    if (!interview) {
      toast.error("Interview data not loaded. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Configure DOMPurify to allow specific tags and attributes
      DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        if (node.tagName === "IMG") {
          node.setAttribute("referrerpolicy", "no-referrer");
        }
      });

      const sanitizedContent = DOMPurify.sanitize(formData.content, {
        ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ul", "ol", "li", "img"],
        ALLOWED_ATTR: ["src", "class", "alt"],
      });

      const changedFields: Partial<{
        name: string;
        position: string;
        title: string;
        category: string;
        excerpt: string;
        date: string;
        content: string;
        imageId: Id<"_storage">;
      }> = {};
      const originalInterview = interview;

      if (formData.name !== originalInterview.name)
        changedFields.name = formData.name;
      if (formData.position !== originalInterview.position)
        changedFields.position = formData.position;
      if (formData.title !== originalInterview.title)
        changedFields.title = formData.title;
      if (formData.category !== originalInterview.category)
        changedFields.category = formData.category;
      if (formData.excerpt !== originalInterview.excerpt)
        changedFields.excerpt = formData.excerpt;
      if (new Date(formData.date).toISOString() !== originalInterview.date)
        changedFields.date = formData.date.toISOString();
      if (sanitizedContent !== originalInterview.content)
        changedFields.content = sanitizedContent;

      let imageStorageId: Id<"_storage"> | undefined = undefined;

      if (selectedFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId as Id<"_storage">;
        changedFields.imageId = imageStorageId;
      }

      // Use existing imageId if no new file is uploaded
      const finalImageId = imageStorageId || interview.imageId;

      if (!finalImageId) {
        toast.error("An image ID is required for the interview.");
        setIsSubmitting(false);
        return;
      }

      const updateData = {
        id: originalInterview._id,
        ...changedFields,
        imageId: finalImageId, // Always include imageId
      };

      await updateInterview(updateData);

      toast.success("Interview updated successfully!");
      router.push("/admin/interviews");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update interview"
      );
      console.error("Error updating interview:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!interview) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <Loader2 className='animate-spin h-12 w-12 text-blue-600' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8 text-center'>
          Update Interview
        </h1>

        <form
          onSubmit={handleSubmit}
          className='space-y-6 bg-white p-6 rounded-xl shadow-lg'>
          <section className='space-y-6'>
            <h2 className='text-xl font-semibold text-gray-700 border-b pb-2'>
              Basic Information
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='name' className='text-gray-600'>
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
                <Label htmlFor='position' className='text-gray-600'>
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
                <Label htmlFor='title' className='text-gray-600'>
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
                <Label htmlFor='category' className='text-gray-600'>
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
                <Label className='text-gray-600'>Interview Date</Label>
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
              <Label htmlFor='excerpt' className='text-gray-600'>
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
              <Label className='text-gray-600'>Interviewee Photo</Label>
              <Input
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                disabled={isSubmitting}
                className='w-full cursor-pointer border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
              />
              <p className='text-sm text-gray-500'>
                {selectedFile
                  ? "New image selected"
                  : "Current image will be kept if no new image is selected"}
              </p>
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
            <h2 className='text-xl font-semibold text-gray-700 border-b pb-2'>
              Interview Content
            </h2>
            <div className='space-y-2'>
              <Label className='text-gray-600'>Full Content</Label>
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
                  Updating...
                </>
              ) : (
                "Update Interview"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
