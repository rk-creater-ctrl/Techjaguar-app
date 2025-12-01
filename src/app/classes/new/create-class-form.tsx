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
import { useFirestore, useUser, useStorage } from '@/firebase';
import { createClass, updateClass } from '@/lib/actions';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Loader2 } from 'lucide-react';
import React, { useRef, useState, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import type { RecordedClass } from '@/lib/schema';
import { uploadFile, type UploadProgress } from '@/lib/storage';
import { Progress } from '@/components/ui/progress';


const classSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  isFree: z.boolean().default(false),
  videoUrl: z.string().url().optional().or(z.literal('')),
});


type ClassFormValues = z.infer<typeof classSchema>;

interface CreateClassFormProps {
    classItem?: RecordedClass & { id: string };
}

export function CreateClassForm({ classItem }: CreateClassFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const isEditing = !!classItem;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadProgress | null>(null);
  const [useUrl, setUseUrl] = useState(isEditing ? !!classItem.videoUrl : true);


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
  
  const handleUploadProgress = useCallback((progress: UploadProgress) => {
    setUploadState(progress);
    if (progress.status === 'success' && progress.downloadURL) {
      form.setValue('videoUrl', progress.downloadURL);
    }
  }, [form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && storage) {
      setFileName(file.name);
      setUploadState({ progress: 0, status: 'uploading' });
      uploadFile(storage, 'class-videos', file, handleUploadProgress);
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
    
    if (!useUrl && (!data.videoUrl || uploadState?.status !== 'success')) {
       toast({
        variant: 'destructive',
        title: 'Upload Not Complete',
        description: 'Please wait for the video to finish uploading before saving.',
      });
      return;
    }
    
    if (useUrl && (!data.videoUrl || !z.string().url().safeParse(data.videoUrl).success)) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please provide a valid video URL.',
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
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
            <FormLabel>Video Source</FormLabel>
            <FormDescription>
                {useUrl ? 'Provide a URL from YouTube, Vimeo, etc.' : 'Upload a video file from your computer.'}
            </FormDescription>
            </div>
            <FormControl>
            <Switch
                checked={!useUrl}
                onCheckedChange={(checked) => setUseUrl(!checked)}
            />
            </FormControl>
        </FormItem>

        {!useUrl ? (
          <FormItem>
              <FormLabel>Video File</FormLabel>
              <FormControl>
                 <div 
                    className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center p-4">
                        {uploadState?.status === 'uploading' ? (
                          <>
                            <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
                            <p className="mt-2 text-sm text-muted-foreground">Uploading {fileName}...</p>
                            <Progress value={uploadState.progress} className="w-full mt-2" />
                          </>
                        ) : uploadState?.status === 'success' ? (
                          <>
                            <Upload className="mx-auto h-8 w-8 text-green-500" />
                            <p className="mt-2 text-sm text-green-600">
                                {fileName} uploaded successfully!
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                Click to browse or drag & drop a video file
                            </p>
                          </>
                        )}
                    </div>
                    <Input 
                        ref={fileInputRef}
                        type="file" 
                        className="sr-only"
                        accept="video/mp4,video/webm"
                        onChange={handleFileChange}
                        disabled={uploadState?.status === 'uploading'}
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


        <Button type="submit" disabled={form.formState.isSubmitting || uploadState?.status === 'uploading'}>
          {form.formState.isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Class')}
        </Button>
      </form>
    </Form>
  );
}
