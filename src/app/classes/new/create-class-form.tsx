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
  videoUrl: z.string().optional(),
  uploadVideo: z.boolean().default(false),
}).refine(data => {
    if (data.uploadVideo) {
        // If uploading, URL is not required. Logic for handling file would be here.
        return true;
    }
    // If not uploading, URL is required and must be a valid URL.
    return !!data.videoUrl && z.string().url().safeParse(data.videoUrl).success;
}, {
    message: 'Please enter a valid video URL.',
    path: ['videoUrl'],
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: isEditing ? {
        title: classItem.title,
        description: classItem.description,
        isFree: classItem.isFree,
        videoUrl: classItem.videoUrl,
        uploadVideo: !classItem.videoUrl, // A simple heuristic
    } : {
      title: '',
      description: '',
      isFree: false,
      videoUrl: '',
      uploadVideo: false,
    },
  });
  
  const uploadVideo = form.watch('uploadVideo');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // In a real app, you would start the upload process here.
      toast({
          title: 'File Selected',
          description: `${file.name}`,
      });
    }
  };


  const onSubmit = async (data: ClassFormValues) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }
    
    // In a real implementation, you would handle the file upload here
    // and get a URL back from your storage service (like Firebase Storage).
    if (data.uploadVideo && !isEditing) { // Simplified for now
        toast({
            variant: 'destructive',
            title: 'Upload Not Implemented',
            description: 'Direct video upload is not connected yet. Please use the URL option.',
        });
        return;
    }

    try {
        const finalData = {
            ...data,
            // If we were uploading, the videoUrl would be set from the storage response
        };

        if (isEditing && classItem.id) {
            await updateClass(firestore, classItem.id, finalData);
            toast({
                title: 'Class Updated',
                description: 'The recorded class has been updated successfully.',
            });
        } else {
             await createClass(firestore, {
                ...finalData,
                videoUrl: finalData.videoUrl || '', // Ensure videoUrl is a string
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
          name="uploadVideo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Upload Video File</FormLabel>
                <FormDescription>
                  Toggle this on to upload a video from your device instead of using a URL.
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

        {uploadVideo ? (
          <FormItem>
              <FormLabel>Video File</FormLabel>
              <FormControl>
                 <div 
                    className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            {fileName ? fileName : 'Click to browse or drag & drop'}
                        </p>
                    </div>
                    <Input 
                        ref={fileInputRef}
                        type="file" 
                        className="sr-only"
                        accept="video/mp4,video/webm"
                        onChange={handleFileChange}
                    />
                </div>
              </FormControl>
              <FormDescription>Select a video file to upload (MP4, WebM).</FormDescription>
              <FormMessage />
            </FormItem>
        ) : (
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
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>
                  Enter the full embed URL for the video (e.g., from YouTube or Vimeo).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
