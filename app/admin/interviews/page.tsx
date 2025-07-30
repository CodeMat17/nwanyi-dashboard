// app/admin/interviews/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function InterviewsPage() {
  const interviews = useQuery(api.interviews.getInterviews);
  const deleteInterview = useMutation(api.interviews.deleteInterview);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInterviews = interviews?.filter(
    (interview) =>
      interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: Id<"interviews">) => {
    try {
      await deleteInterview({ id });
      toast.success("Interview deleted successfully");
    } catch (error) {
      toast.error("Failed to delete interview");
      console.error(error);
    }
  };

  if (!interviews) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ife-green' />
      </div>
    );
  }

  return (
    <div className='min-h-screen mx-auto py-8'>
      <div className='flex flex-col lg:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <h1 className='text-3xl font-bold'>Interview Management</h1>
        <div className='flex items-center gap-4 w-full md:w-auto'>
          <div className='relative w-full md:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search interviews...'
              className='pl-10'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href='/admin/interviews/add-interview'>
              <Plus className='mr-2 h-4 w-4' />
              Add Interview
            </Link>
          </Button>
        </div>
      </div>

      {filteredInterviews?.length === 0 ? (
        <Card className='text-center py-12'>
          <p className='text-gray-500'>
            {searchTerm
              ? "No interviews match your search"
              : "No interviews found"}
          </p>
        </Card>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {filteredInterviews?.map((interview) => (
            <Card
              key={interview._id}
              className='hover:shadow-lg transition-shadow  w-full md:w-md lg:w-full'>
              <CardContent className=''>
                <div>
                  <h3 className='font-semibold'>{interview.name}</h3>
                  <p className='text-sm text-gray-600 line-clamp-1'>
                    {interview.position}
                  </p>
                </div>
                <div className='flex items-center gap-2 mt-3'>
                  {interview.image && (
                    <div className='relative h-20 w-20 rounded-md overflow-hidden shrink-0'>
                      <Image
                        src={interview.image}
                        alt={interview.name}
                        fill
                        className='object-cover rounded-xl'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      />
                    </div>
                  )}
                  <div>
                    <h3 className='font-semibold line-clamp-1'>
                      {interview.title}
                    </h3>
                    <p className='text-sm text-gray-600 line-clamp-3'>
                      {interview.excerpt}
                    </p>
                  </div>
                </div>

                <div className='mt-2 flex items-center gap-2 text-amber-500'>
                  <Badge className='text-white bg-amber-500 rounded-full'>
                    {" "}
                    {interview.category}
                  </Badge>{" "}
                  |
                  <p className='text-sm '>
                    {dayjs(interview.date).format("MMM DD, YYYY")}
                  </p>
                </div>
              </CardContent>
              <CardContent className='flex justify-end gap-2'>
                <Button variant='outline' size='sm' asChild>
                  <Link href={`/admin/interviews/update/${interview.slug}`}>
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(interview._id)}>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
