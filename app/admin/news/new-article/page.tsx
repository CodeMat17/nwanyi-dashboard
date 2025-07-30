"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "../../components/ImageUploader";
import { RichTextEditor } from "../../components/RichTextEditor";
import { Switch } from "@/components/ui/switch";

export default function AddNewArticlePage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createNews = useMutation(api.news.create);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    featured: false,
    compressedFile: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageChange = (file: File) => {
    setFormData((prev) => ({ ...prev, compressedFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.compressedFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Upload image
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": formData.compressedFile.type },
        body: formData.compressedFile,
      });
      const { storageId } = await result.json();

      // Step 2: Create article
      await createNews({
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        featured: formData.featured,
        imageId: storageId,
        date: new Date().toISOString(),
      });

      toast.success("Article created successfully");
      router.push("/admin/news");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create article");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            Create New Article
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
              {/* Left Column - Form Fields */}
              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='title'>Title *</Label>
                  <Input
                    id='title'
                    name='title'
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='excerpt'>Excerpt *</Label>
                  <Input
                    id='excerpt'
                    name='excerpt'
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='category'>Category *</Label>
                  <Input
                    id='category'
                    name='category'
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    id='featured'
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, featured: checked }))
                    }
                  />
                  <Label htmlFor='featured'>Featured Article</Label>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className='space-y-1.5'>
                <Label>Article Image *</Label>
                <ImageUploader
                  onImageChange={handleImageChange}
                  maxSizeMB={0.2}
                  maxDimension={720}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className='space-y-2'>
              <Label>Content *</Label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder='Write your article content here...'
              />
            </div>

            <div className='flex justify-end pt-4 space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push("/admin/news")}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isLoading ? "Creating..." : "Create Article"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
