"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

type Item = { title: string; body: string };
type Props = {
  essence: {
    _id: Id<"essenceOfName">;
    title: string;
    caption: string;
    data: Item[];
  };
};

const EssenceOfNameCard = ({ essence }: Props) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(essence.title);
  const [caption, setCaption] = useState(essence.caption);
  const [data, setData] = useState<Item[]>(essence.data);

  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const updateEssence = useMutation(api.about.updateEssenceOfName);

  useEffect(() => {
    if (essence) {
      setTitle(essence.title);
      setCaption(essence.caption);
      setData(essence.data);
    }
  }, [essence]);

  const handleItemChange = (index: number, key: keyof Item, value: string) => {
    setData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateEssence({ id: essence._id, title, caption, data });
      toast.success("Essence of name updated");
      setEditing(false);
      setEditingIndex(null);
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle className='text-lg font-semibold'>
          {editing ? (
            <Input
              className='text-lg font-semibold'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Title'
            />
          ) : (
            title || "Essence of Our Name"
          )}
        </CardTitle>

        <div className='flex gap-2'>
          {editing && (
            <Button
              variant='default'
              size='sm'
              onClick={handleSave}
              disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setEditing(!editing);
              setEditingIndex(null);
            }}>
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {editing ? (
          <div className='space-y-4'>
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

            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
              {data.map((item, i) => (
                <div key={i} className='border p-4 rounded-xl space-y-2'>
                  {editingIndex === i ? (
                    <>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          handleItemChange(i, "title", e.target.value)
                        }
                        placeholder='Item Title'
                      />
                      <Textarea
                        value={item.body}
                        onChange={(e) =>
                          handleItemChange(i, "body", e.target.value)
                        }
                        placeholder='Item Body'
                        rows={3}
                      />
                      <div className='flex justify-end gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => setEditingIndex(null)}>
                          Cancel
                        </Button>
                        <Button
                          size='sm'
                          onClick={handleSave}
                          disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className='text-md font-semibold'>{item.title}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {item.body}
                      </p>
                      <div className='flex justify-end'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setEditingIndex(i)}>
                          Edit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p>{caption}</p>
            <div className='grid mt-4 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
              {data.map((item, i) => (
                <div key={i} className='border p-5 rounded-xl'>
                  <h4 className='text-lg font-semibold'>{item.title}</h4>
                  <p className='mt-2'>{item.body}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EssenceOfNameCard;
