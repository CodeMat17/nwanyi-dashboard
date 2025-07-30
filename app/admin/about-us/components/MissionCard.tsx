// components/about/MissionCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  mission: {
    _id: Id<'mission'>;
    title: string;
    caption: string;
    body: string;
  };
};

const MissionCard = ({ mission }: Props) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [body, setBody] = useState("");

  const updateMission = useMutation(api.about.updateMission);

  useEffect(() => {
    if (mission) {
      setTitle(mission.title);
      setCaption(mission.caption);
      setBody(mission.body);
    }
  }, [mission]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateMission({
        id: mission._id,
        title,
        caption,
        body,
      });
      toast.success("Mission updated successfully");
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update mission");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle className='text-lg font-semibold'>
          {mission?.title || "Mission"}
        </CardTitle>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setEditing((prev) => !prev)}>
          {editing ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleUpdate} className='space-y-4'>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Title'
            />
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder='Caption'
            />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='Body'
              rows={5}
            />
            <div className='flex gap-2'>
              <Button type='submit'>{saving ? "Saving..." : "Save"}</Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <p className=''>{mission.caption}</p>
            <p className='mt-4'>{mission.body}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MissionCard;
