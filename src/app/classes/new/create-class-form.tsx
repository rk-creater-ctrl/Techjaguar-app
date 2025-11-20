'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { createClass } from '@/lib/actions';
import { v4 as uuidv4 } from 'uuid';

const classSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  videoUrl: z.string().url('Please enter a valid URL.'),
});

type ClassFormValues = z.infer<typeof classSchema>;

export function CreateClassForm() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
    },
  });

  const onSubmit = async (data: ClassFormValues) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to add a class.',
      });
      return;
    }

    try {
      await createClass(firestore, {
        ...data,
        id: uuidv4(),
        instructorId: user.uid,
      });

      toast({
        title: 'Class Added',
        description: 'The recorded class has been added successfully.',
      });
      router.push('/classes');
      router.refresh(); 
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not add the class.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Advanced React Patterns"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A clear and concise title for your recorded class.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this class covers..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
               <FormDescription>
                A brief summary of the topics covered in the video.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Paste the full URL of the video (e.g., from YouTube, Vimeo).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Adding...' : 'Add Class'}
        </Button>
      </form>
    </Form>
  );
}
