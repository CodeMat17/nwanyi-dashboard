// components/NominationsList.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export function NominationsList() {
  // Fix: Get nominations without arguments since we filter client-side
  const nominations = useQuery(api.nominations.getNominations, {});
  const deleteNomination = useMutation(api.nominations.deleteNomination);

  const [deleteId, setDeleteId] = useState<Id<"nominations"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteNomination({ id: deleteId });
      toast.success("Nomination deleted successfully");
    } catch (error) {
        toast.error("Failed to delete nomination");
        console.log('ErrorMsg: ', error);
    } finally {
      setDeleteId(null);
      setIsDeleting(false);
    }
  };

  const filteredNominations = nominations?.filter((nomination) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      nomination.nominee.fullName.toLowerCase().includes(term) ||
      nomination.nominee.title.toLowerCase().includes(term) ||
      nomination.nominator.fullName.toLowerCase().includes(term) ||
      nomination.nominee.email.toLowerCase().includes(term)
    );
  });

  if (nominations === undefined) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500'></div>
      </div>
    );
  }

  if (nominations.length === 0) {
    return (
      <div className='text-center py-12 space-y-4'>
        <div className='mx-auto w-24 h-24 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-12 w-12 text-amber-600 dark:text-amber-300'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            />
          </svg>
        </div>
        <h3 className='text-xl font-medium'>No nominations yet</h3>
        <p className='text-gray-500'>
          Nominations will appear here once submitted
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between gap-4'>
        <div className='flex-1 max-w-md'>
          <Input
            placeholder='Search nominations...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='outline' className='px-3 py-1'>
            {filteredNominations?.length || 0} nominations
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {filteredNominations?.map((nomination) => (
          <Card
            key={nomination._id}
            className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <div className='flex items-start space-x-3'>
                <Avatar>
                  <AvatarFallback>
                    {nomination.nominee.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className='text-muted-foreground text-sm'>
                  <CardTitle className='text-lg'>
                    {nomination.nominee.fullName}
                  </CardTitle>
                  <p>{nomination.nominee.title}</p>
                  <p className='text-sm'>{nomination.nominee.email}</p>
                  <p className='text-sm'>{nomination.nominee.phone}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Reason</p>
                <p className='text-sm line-clamp-3'>
                  {nomination.nominee.reason}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Submitted by
                </p>
                <p>{nomination.nominator.fullName}</p>
                <p className='text-sm'>
                  {nomination.nominator.email}
                        </p>
                        <p>{nomination.nominator.phone}</p>
              </div>
            </CardContent>
            <CardFooter className='flex justify-between items-center'>
              <p className='text-xs text-gray-500'>
                {format(new Date(nomination._creationTime), "MMM d, yyyy")}
              </p>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => setDeleteId(nomination._id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              nomination.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-red-600 hover:bg-red-700'>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
