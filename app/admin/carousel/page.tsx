"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import EditCarousel from "./components/EditCarousel";
import { useState } from "react";

export default function CarouselPage() {
  const carousels = useQuery(api.carousel.getCarouselItems) || [];
  const deleteCarousel = useMutation(api.carousel.deleteCarousel);
  const [editingItem, setEditingItem] = useState<null | {
    id: Id<"carousel">;
    title: string;
    tag: string;
  }>(null);

  const handleDelete = async (id: Id<"carousel">, imageUrl: string) => {
    try {
      await deleteCarousel({ id, imageUrl });
      toast.success("Done!", {
        description: "Carousel item deleted successfully",
      });
    } catch (error) {
      toast.error("Error!", { description: "Failed to delete carousel item" });
      console.log("Error Msg: ", error);
    }
  };

  return (
    <div className='min-h-screen container mx-auto py-8'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <h1 className='text-xl font-bold'>Carousel Items</h1>
        <Button asChild className='w-full sm:w-auto'>
          <Link href='/admin/carousel/add-carousel'>Add Carousel</Link>
        </Button>
      </div>

      <div className='mt-4'>
        {carousels.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No carousel items yet</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {carousels.map((carousel) => (
              <div key={carousel._id} className='relative group'>
                <div className='relative aspect-video rounded-lg overflow-hidden border'>
                  <Image
                    src={carousel.image}
                    alt={carousel.title}
                    fill
                    className='object-cover'
                  />
                  {/* Always visible info on mobile, hover effect on desktop */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent  flex flex-col justify-end p-4'>
                    <h3 className='text-white font-medium text-sm md:text-base leading-5'>
                      {carousel.title}
                    </h3>
                    <span className='text-white/80 text-xs md:text-sm'>
                      {carousel.tag}
                    </span>
                  </div>
                </div>
                {/* Always visible actions on mobile */}
                <div className='absolute top-2 right-2'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        size='icon'
                        className='w-8 h-8 bg-background/80 backdrop-blur-sm'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='min-w-[150px]'>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setEditingItem({
                            id: carousel._id,
                            title: carousel.title,
                            tag: carousel.tag,
                          });
                        }}
                        className='cursor-pointer'>
                        <Edit className='mr-2 h-4 w-4' />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-destructive cursor-pointer'
                        onClick={() =>
                          handleDelete(carousel._id, carousel.image)
                        }>
                        <Trash2 className='mr-2 h-4 w-4' />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditCarousel
          carouselItem={editingItem}
          onClose={() => setEditingItem(null)}
          isOpen={!!editingItem}
        />
      )}
    </div>
  );
}
