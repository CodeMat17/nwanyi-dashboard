"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  testimonial: {
    _id: Id<"testimonial">;
    name: string;
    position: string;
    body: string;
    caption: string;
  };
};

export default function TestimonialCard({ testimonial }: Props) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [caption, setCaption] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const updateTestimonial = useMutation(api.about.updateTestimonial);

  useEffect(() => {
    if (testimonial) {
      setBody(testimonial.body);
      setName(testimonial.name);
      setPosition(testimonial.position);
      setCaption(testimonial.caption);
    }
  }, [testimonial]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateTestimonial({ id: testimonial._id, body, name, position, caption });
      toast.success("Testimonial updated");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update testimonial");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle className='text-lg font-semibold'>Testimonial</CardTitle>
        <Button variant={'outline'} size='sm' onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSave} className='space-y-4'>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='Testimonial'
            />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Name'
            />
            <Input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder='Position'
            />
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder='Caption'
            />
            <Button type='submit' disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </form>
        ) : (
          <>
            <blockquote className='italic mb-2'>“{body}”</blockquote>
            <p className='font-semibold'>{name}</p>
            <p className='text-sm text-muted-foreground'>{position}</p>
            <p className='mb-4 text-sm text-muted-foreground'>{caption}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
