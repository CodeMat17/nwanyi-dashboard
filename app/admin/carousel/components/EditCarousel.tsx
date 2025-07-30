"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

interface CarouselItem {
  id: Id<"carousel">;
  title: string;
  tag: string;
}

interface EditCarouselProps {
  carouselItem: CarouselItem;
  onClose: () => void;
  isOpen: boolean;
}

const EditCarousel = ({ carouselItem, onClose, isOpen }: EditCarouselProps) => {
  const updateCarousel = useMutation(api.carousel.updateCarousel);
  const [title, setTitle] = useState(carouselItem.title);
  const [tag, setTag] = useState(carouselItem.tag);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !tag) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      await updateCarousel({
        id: carouselItem.id,
        title,
        tag,
      });
      toast.success("Carousel updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update carousel");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Carousel Item</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setTitle(e.target.value);
                }
              }}
              disabled={isSaving}
              placeholder='Enter title'
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
              disabled={isSaving}
            />
            {tag.trim().split(/\s+/).length > 2 && (
              <p className='text-sm text-red-500'>Maximum 2 words allowed</p>
            )}
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCarousel;
