"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import EssenceOfNameCard from "./components/EssenceOfNameCard";
import GuidingPrincipleCard from "./components/GuidingPrincipleCard";
import MissionCard from "./components/MissionCard";
import OurJourneyCard from "./components/OurJourneyCard";
import TestimonialCard from "./components/TestimonialCard";

const AboutUs = () => {
  // Fetch data using queries
  const mission = useQuery(api.about.getMission);
  const guidingPrinciple = useQuery(api.about.getGuidingPrinciple);
  const essenceOfName = useQuery(api.about.getLatestEssenceOfName);
  const ourJourney = useQuery(api.about.getLatestOurJourney);
  const testimonial = useQuery(api.about.getTestimonial);
  const aboutImage = useQuery(api.about.getAboutImage);

  // State for image upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Mutations
  const updateAboutImage = useMutation(api.about.updateAboutImage);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Handle file upload
  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !aboutImage) return;

    setUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await response.json();

      await updateAboutImage({
        id: aboutImage._id,
        newImageId: storageId,
      });
      toast.success("Image updated successfully");
    } catch (error) {
      console.log("Error Msg: ", error);
      toast.error("Failed to update image");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className='min-h-screen container mx-auto py-8 space-y-12'>
      <div className='grid lg:grid-cols-2 gap-4'>
        {/* About Image */}
        <Card>
          <CardHeader className='flex flex-row justify-between items-center'>
            <CardTitle className='text-lg'>About Image</CardTitle>
          </CardHeader>
          <CardContent>
            {aboutImage ? (
              <div>
                <div className='relative w-full max-w-md h-64'>
                  <Image
                    src={aboutImage.imageUrl}
                    alt='About'
                    fill
                    className='rounded-lg object-cover'
                    priority
                  />
                </div>
                <form onSubmit={handleImageUpload} className='mt-4 space-y-4'>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Button type='submit' disabled={!file || uploading}>
                    {uploading ? "Uploading..." : "Update Image"}
                  </Button>
                </form>
              </div>
            ) : (
              <p>Loading image...</p>
            )}
          </CardContent>
        </Card>

        {/* Mission */}
        {mission ? (
          <MissionCard mission={mission} />
        ) : (
          <p>Loading mission...</p>
        )}
      </div>

      {/* Essence of Name */}
      {essenceOfName ? (
        <EssenceOfNameCard essence={essenceOfName} />
      ) : (
        <p>Loading...</p>
      )}

      {/* Our Journey */}
      {ourJourney ? <OurJourneyCard journey={ourJourney} /> : <p>Loading...</p>}

      <div className='grid lg:grid-cols-2 gap-4'>
        {/* Guiding Principle */}
        {guidingPrinciple ? (
          <GuidingPrincipleCard guidingPrinciple={guidingPrinciple} />
        ) : (
          <p>Loading...</p>
        )}

        {/* Testimonial */}
        {testimonial ? (
          <TestimonialCard testimonial={testimonial} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
