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
import { createClass, updateClass } from '@/lib/actions';
import { v4 as uuidv4 } from 'uuid';
import { Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import type { RecordedClass } from '@/lib/schema';


const classSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  isFree: z.boolean().default(false),
  videoUrl: z.string().url('Please enter a valid video URL.'),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface CreateClassFormProps {
    classItem?: RecordedClass & { id: string };
}

export function CreateClassForm({ classItem }: CreateClassFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const isEditing = !!classItem;

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: isEditing ? {
        title: classItem.title,
        description: classItem.description,
        isFree: classItem.isFree,
        videoUrl: classItem.videoUrl,
    } : {
      title: '',
      description: '',
      isFree: false,
      videoUrl: '',
    },
  });

  const onSubmit = async (data: ClassFormValues) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }
    
    try {
        if (isEditing && classItem.id) {
            await updateClass(firestore, classItem.id, data);
            toast({
                title: 'Class Updated',
                description: 'The recorded class has been updated successfully.',
            });
        } else {
             await createClass(firestore, {
                ...data,
                id: uuidv4(),
                instructorId: user.uid,
            });

            toast({
                title: 'Class Added',
                description: 'The recorded class has been added successfully.',
            });
        }

      router.push('/classes');
      router.refresh(); 
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || `Could not ${isEditing ? 'update' : 'add'} the class.`,
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
                  placeholder="https://www.youtube.com/embed/..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the full embed URL for the video (e.g., from YouTube or Vimeo).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                <FormLabel>Free Class</FormLabel>
                <FormDescription>
                    Is this class available for free?
                </FormDescription>
                </div>
                <FormControl>
                <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
                </FormControl>
            </FormItem>
            )}
        />


        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Class')}
        </Button>
      </form>
    </Form>
  );
}
