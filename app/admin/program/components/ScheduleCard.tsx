"use client";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Plus, Save, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ScheduleCard() {
  const schedule = useQuery(api.schedule.getSchedule);
  const uploadSchedule = useMutation(api.schedule.uploadScheduleItem);
  const deleteSchedule = useMutation(api.schedule.deleteScheduleItem);
  const updateSchedule = useMutation(api.schedule.updateScheduleItem);

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<Id<"schedule"> | null>(null);

  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:30");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setStartTime("08:00");
    setEndTime("09:30");
    setTitle("");
    setDescription("");
    setEditingId(null);
  };

  const isOverlapping = (
    newStart: string,
    newEnd: string,
    excludeId?: Id<"schedule">
  ): boolean => {
    if (!schedule) return false;

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const newStartMin = toMinutes(newStart);
    const newEndMin = toMinutes(newEnd);

    return schedule.some((item) => {
      if (item._id === excludeId) return false;
      const existingStart = toMinutes(item.startTime);
      const existingEnd = toMinutes(item.endTime);
      return newStartMin < existingEnd && newEndMin > existingStart;
    });
  };

  const handleAddOrUpdate = async () => {
    if (!startTime || !endTime || !title || !description) {
      toast.error("All fields are required.");
      return;
    }

    if (isOverlapping(startTime, endTime, editingId || undefined)) {
      toast.error("Schedule times are overlapping.");
      return;
    }

    const payload = {
      startTime,
      endTime,
      title,
      description,
    };

    try {
      setLoading(true);
      if (editingId) {
        await updateSchedule({ id: editingId, ...payload });
        toast.success("Schedule updated");
      } else {
        await uploadSchedule(payload);
        toast.success("Schedule added");
      }
      resetForm();
    } catch (err) {
        console.log('Error saving schedule', err);
      toast.error("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: Id<"schedule">) => {
    try {
      await deleteSchedule({ id });
      toast.success("Schedule deleted");
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  const handleEdit = (item: {
    _id: Id<"schedule">;
    startTime: string;
    endTime: string;
    title: string;
    description: string;
  }) => {
    setEditingId(item._id);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setTitle(item.title);
    setDescription(item.description);
  };

  const sortedSchedule = [...(schedule || [])].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className='w-full max-w-7xl mx-auto '>
      <h1 className='text-xl font-bold'>Festival Schedule</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4'>
        {sortedSchedule.map((item) => (
          <div
            key={item._id}
            className='border p-4 rounded-md relative group bg-white shadow-md dark:bg-gray-800'>
            <p className='font-semibold text-sm text-muted-foreground'>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </p>
            <h3 className='font-bold'>{item.title}</h3>
            <p className='text-sm text-muted-foreground'>{item.description}</p>
            <div className='absolute top-2 right-2 flex gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleEdit(item)}
                className='text-blue-500 hover:bg-transparent'>
                <Pencil className='w-4 h-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleDelete(item._id)}
                className='text-red-500 hover:bg-transparent'>
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className='rounded-xl mt-4 p-4 space-y-2 border bg-white shadow-md dark:bg-gray-800'>
        <h4 className='font-semibold text-base'>
          {editingId ? "Edit Schedule Item" : "Add New Schedule Item"}
        </h4>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label className='text-muted-foreground'>Start Time</Label>
            <Input
              type='time'
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className='space-y-1.5'>
            <Label className='text-muted-foreground'>End Time</Label>
            <Input
              type='time'
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <Input
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className='flex gap-2'>
          <Button onClick={handleAddOrUpdate} disabled={loading}>
            {loading ? (
              "Saving..."
            ) : editingId ? (
              <>
                <Save className='w-4 h-4 mr-1' /> Save Changes
              </>
            ) : (
              <>
                <Plus className='w-4 h-4 mr-1' /> Add Item
              </>
            )}
          </Button>
          {editingId && (
            <Button variant='ghost' onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}
