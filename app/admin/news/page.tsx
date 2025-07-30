"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";

export default function NewsDashboard() {
  const router = useRouter();
  const news = useQuery(api.news.getAll);
  const remove = useMutation(api.news.remove);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this news article?")) {
      try {
        await remove({ id: id as Id<"news"> });
        toast.success("News article deleted");
      } catch (error) {
          console.log('Error Msg: ', error);
        toast.error("Failed to delete article");
      }
    }
  };

  if (!news) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen container mx-auto py-8 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>News Articles</h1>
        <Button onClick={() => router.push("/admin/news/new-article")}>
          <Plus className='mr-2 h-4 w-4' />
          New Article
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {news.map((article) => (
          <Card key={article._id} className='hover:shadow-lg transition-shadow py-0 dark:bg-gray-800'>
            <div className='relative aspect-video'>
              <Image
                src={article.image}
                alt={article.title}
                fill
                className='object-cover rounded-t-lg'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
              {article.featured && (
                <Badge className='absolute top-2 left-2 bg-green-600'>
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className='px-4 space-y-2'>
              <div className='flex justify-between items-start'>
                <h3 className='font-semibold line-clamp-2'>{article.title}</h3>
              </div>
              <div className='flex items-center space-x-2'>
                <Badge variant='outline'>{article.category}</Badge>
                <span className='text-sm text-muted-foreground'>
                  {format(new Date(article.date), "MMM d, yyyy")}
                </span>
              </div>
              <p className='text-sm line-clamp-2 text-muted-foreground'>
                {article.excerpt}
              </p>
              <div className='flex justify-end space-x-2 pt-2 pb-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.push(`/admin/news/${article.slug}`)}>
                  Edit
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(article._id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {news.length === 0 && (
        <Card>
          <CardContent className='p-8 text-center'>
            <p className='text-gray-500'>No news articles found</p>
            <Button
              className='mt-4'
              onClick={() => router.push("/admin/news/new-article")}>
              Create your first article
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
