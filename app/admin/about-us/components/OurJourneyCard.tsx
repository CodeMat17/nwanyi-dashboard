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

type Milestone = { year: string; title: string; body: string, };

type Props = {
  journey: {
    _id: Id<"ourJourney">;
    title: string;
    caption: string;
    journey: Milestone[];
  };
};

const OurJourneyCard = ({ journey }: Props) => {
  const [title, setTitle] = useState(journey.title);
  const [caption, setCaption] = useState(journey.caption);
  const [milestones, setMilestones] = useState<Milestone[]>(journey.journey);
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingMilestones, setEditingMilestones] = useState<boolean[]>([]);

  const updateJourney = useMutation(api.about.updateOurJourney);

  useEffect(() => {
    setTitle(journey.title);
    setCaption(journey.caption);
    setMilestones(journey.journey);
    setEditingMilestones(journey.journey.map(() => false));
  }, [journey]);

  const handleSave = async () => {
    try {
      await updateJourney({
        id: journey._id,
        title,
        caption,
        journey: milestones,
      });
      toast.success("Journey updated");
      setEditingHeader(false);
      setEditingMilestones(milestones.map(() => false));
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    }
  };

  const handleMilestoneChange = (
    index: number,
    key: keyof Milestone,
    value: string
  ) => {
    const updated = [...milestones];
    updated[index][key] = value;
    setMilestones(updated);
  };

  const toggleMilestoneEdit = (index: number) => {
    const updated = [...editingMilestones];
    updated[index] = !updated[index];
    setEditingMilestones(updated);
  };

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        {editingHeader ? (
          <div className='w-full space-y-2'>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Title'
            />
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder='Caption'
              rows={2}
            />
            <div className='flex gap-2 justify-end'>
              <Button onClick={handleSave}>Save</Button>
              <Button variant='outline' onClick={() => setEditingHeader(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <CardTitle>{title}</CardTitle>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setEditingHeader(true)}>
              Edit Header
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
        {!editingHeader && <p className='mb-4'>{caption}</p>}
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
          {milestones.map((milestone, i) =>
            editingMilestones[i] ? (
              <div
                key={i}
                className='border p-4 rounded-xl space-y-2 bg-muted/30'>
                <Input
                  value={milestone.year}
                  onChange={(e) =>
                    handleMilestoneChange(i, "year", e.target.value)
                  }
                  placeholder='Year'
                />
                <Input
                  value={milestone.title}
                  onChange={(e) =>
                    handleMilestoneChange(i, "title", e.target.value)
                  }
                  placeholder='Title'
                />
                <Textarea
                  value={milestone.body}
                  onChange={(e) =>
                    handleMilestoneChange(i, "body", e.target.value)
                  }
                  placeholder='Description'
                  rows={3}
                />
                <div className='flex justify-end gap-2'>
                  <Button onClick={handleSave}>Save</Button>
                  <Button
                    variant='outline'
                    onClick={() => toggleMilestoneEdit(i)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div key={i} className='border p-4 rounded-xl'>
                <h4 className='text-md font-semibold text-blue-600'>
                  {milestone.year}
                </h4>
                <h5 className='font-medium text-lg'>{milestone.title}</h5>
                <p className='text-sm mt-1'>{milestone.body}</p>
                <div className='mt-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => toggleMilestoneEdit(i)}>
                    Edit
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OurJourneyCard;
