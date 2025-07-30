"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import imageCompression from "browser-image-compression";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_WIDTH = 150;

const PartnersPage = () => {
  const partnershipSupport = useQuery(api.partners.getPartnershipSupport);
  const updatePartnershipSupport = useMutation(
    api.partners.updatePartnershipSupport
  );

  const logos = useQuery(api.partners.getLogos);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveLogo = useMutation(api.partners.uploadLogo);
  const deleteLogo = useMutation(api.partners.deleteLogo);

  const [uploading, setUploading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [successIds, setSuccessIds] = useState<Id<"_storage">[]>([]);

  useEffect(() => {
    if (partnershipSupport) {
      setTitle(partnershipSupport.title);
      setBody(partnershipSupport.body);
    }
  }, [partnershipSupport]);

  const handleSave = async () => {
    if (!partnershipSupport) return;
    setIsSaving(true);
    try {
      await updatePartnershipSupport({
        title,
        body,
      });
      toast.success("Partnership support updated");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update partnership support");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!partnershipSupport) {
    return (
      <div className='min-h-screen px-4 py-12'>
        <div className='max-w-xl mx-auto'>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const compressedFile = await imageCompression(file, {
          maxWidthOrHeight: MAX_WIDTH,
          useWebWorker: true,
        });

        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": compressedFile.type },
          body: compressedFile,
        });

        const { storageId } = await res.json();
        await saveLogo({ logoId: storageId });
        toast.success("Logo uploaded");

        // ✅ Show success
        setSuccessIds((prev) => [...prev, storageId]);
        toast.success("Logo uploaded");

        // 🕓 Remove success after 3s
        setTimeout(() => {
          setSuccessIds((prev) => prev.filter((id) => id !== storageId));
        }, 3000);
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload logo");
      }
    }

    setUploading(false);
    event.target.value = ""; // reset input
  };

  const handleDelete = async (logoId: Id<"partnersLogo">) => {
    try {
      await deleteLogo({ id: logoId });
      toast.success("Logo deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete logo");
    }
  };

  return (
    <div className='min-h-screen py-12'>
      <div className='max-w-xl mx-auto'>
        <h1 className='text-4xl font-bold text-center mb-6'>Partners Page</h1>
        <div className='space-y-8'>
          <Card>
            <CardHeader className='flex justify-between items-center'>
              {editing ? (
                <Input
                  className='text-lg font-semibold'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Title'
                />
              ) : (
                <CardTitle className='text-lg font-semibold'>
                  {partnershipSupport.title}
                </CardTitle>
              )}
              <Button
                size='sm'
                variant='outline'
                onClick={() => setEditing((prev) => !prev)}>
                {editing ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>

            <CardContent className='space-y-4'>
              {editing ? (
                <>
                  <div>
                     <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='Enter partnership support message'
                    rows={5}
                    maxLength={500}
                  />
                  <div className='mt-1 text-sm text-muted-foreground text-right'>
                    {body.length}/500 characters
                  </div>
                  </div>
                 

                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <p>{partnershipSupport.body}</p>
              )}
            </CardContent>
          </Card>

          <Card className=''>
            <CardHeader>
              <CardTitle>Partner Logos</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <label className='cursor-pointer hover:opacity-80'>
                <input
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={handleFileChange}
                  className='hidden'
                />

                <Button asChild variant='outline' disabled={uploading}>
                  <span>{uploading ? "Uploading..." : "Upload Logos"}</span>
                </Button>
              </label>

              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4'>
                {logos?.map((logo) => (
                  <div key={logo._id} className='relative group'>
                    <Image
                      src={logo.logos}
                      alt='Partner Logo'
                      width={150}
                      height={150}
                      className={`object-contain border bg-white p-2 rounded shadow max-h-[150px] transition ${
                        successIds.includes(logo.logoId)
                          ? "ring-2 ring-green-500"
                          : ""
                      }`}
                    />

                    {successIds.includes(logo.logoId) && (
                      <CheckCircle
                        className='absolute top-2 left-2 text-green-500 bg-white rounded-full shadow'
                        size={20}
                      />
                    )}

                    <Button
                      variant='destructive'
                      size='icon'
                      className='absolute top-1 right-1 transition'
                      onClick={() => handleDelete(logo._id)}>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;
