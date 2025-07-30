"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import imageCompression from "browser-image-compression";
import { useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

async function compressAndUploadFile(
  file: File,
  generateUrl: () => Promise<string>
): Promise<Id<"_storage">> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 160,
    maxSizeMB: 0.05,
    useWebWorker: true,
  });

  const uploadUrl = await generateUrl();
  const res = await fetch(uploadUrl, {
    method: "POST",
    body: compressed,
  });

  if (!res.ok) throw new Error("Upload failed");

  const { storageId } = await res.json();
  return storageId as Id<"_storage">;
}

export default function SpeakerCard() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createSpeaker = useMutation(api.speakers.createSpeaker);
  const speakers = useQuery(api.speakers.getSpeakers);
  const deleteSpeaker = useMutation(api.speakers.deleteSpeaker);

  const handleCreate = async () => {
    try {
      if (!file) return toast.error("Please select an image");

      const imageId = await compressAndUploadFile(file, generateUploadUrl);

      await createSpeaker({ name, position, bio, twitter, linkedin, imageId });

      toast.success("Speaker created");

      setName("");
      setPosition("");
      setBio("");
      setTwitter("");
      setLinkedin("");
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create speaker");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 1024 * 50) {
      toast.error("Image must be under 50KB");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleDelete = async (id: Id<"speakers">) => {
    try {
      await deleteSpeaker({ id });
      toast.success("Speaker deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete speaker");
    }
  };

  return (
    <div className='space-y-8 max-w-2xl mx-auto p-4'>
      <div className='bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 space-y-4'>
        <h2 className='text-lg font-bold'>Add New Speaker</h2>
        <Input
          placeholder='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder='Position'
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <Textarea
          placeholder='Bio'
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <Input
          placeholder='X ( twitter handle)'
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
        />
        <Input
          placeholder='linkedin handle'
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
        <Input type='file' accept='image/*' onChange={handleFileChange} />
        {previewUrl && (
          <div className='flex justify-center'>
            <Image
              src={previewUrl}
              alt='Preview'
              width={100}
              height={100}
              className='rounded-full object-cover'
            />
          </div>
        )}
        <Button onClick={handleCreate}>Create Speaker</Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {speakers?.map((speaker) => (
          <div
            key={speaker._id}
            className='relative rounded-lg border shadow-sm p-4 flex flex-col items-center space-y-2'>
            {speaker.image && (
              <Image
                src={speaker.image}
                alt={speaker.name}
                width={100}
                height={100}
                className='rounded-full object-cover'
              />
            )}
            <div className='text-center'>
              <h3 className='font-semibold'>{speaker.name}</h3>
              <p className='text-sm text-gray-500'>{speaker.position}</p>
            </div>
            <Button
              size={"icon"}
              variant={"destructive"}
              className='absolute top-1 right-1'
              onClick={() => handleDelete(speaker._id)}>
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
