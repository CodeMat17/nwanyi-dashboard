// components/about/GuidingPrincipleCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  guidingPrinciple: {
    title: string;
    body: string;
  };
};

const GuidingPrincipleCard = ({ guidingPrinciple }: Props) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(guidingPrinciple);
    const update = useMutation(api.about.updateGuidingPrinciple);
    
    const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      
      setIsSaving(true);
    try {
      await update(form);
      toast.success("Guiding principle updated");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>{guidingPrinciple.title || "Guiding Principle"}</CardTitle>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleUpdate} className='space-y-4'>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder='Title'
            />
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder='Body'
              rows={5}
            />
            <div className='flex gap-2'>
              <Button disabled={isSaving} type='submit'>{isSaving ? "Saving..." : "Save"}</Button>
              <Button
                variant='outline'
                type='button'
                onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p>{guidingPrinciple.body}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GuidingPrincipleCard;
