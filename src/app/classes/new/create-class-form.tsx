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
import { Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';


const classSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  isFree: z.boolean().default(false),
  // videoUrl is now handled separately
});

type ClassFormValues = z.infer<typeof classSchema>;

export function CreateClassForm() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      title: '',
      description: '',
      isFree: false,
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
    
    if (!fileInputRef.current?.files?.[0]) {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please select a video file to upload.',
        });
        return;
    }

    try {
      // In a real app, you would upload the file to cloud storage (e.g., Firebase Storage)
      // and get a public URL. For now, we'll use a placeholder.
      const placeholderVideoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

      await createClass(firestore, {
        ...data,
        videoUrl: placeholderVideoUrl,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <FormItem>
                <FormLabel>Video File</FormLabel>
                <FormControl>
                    <div>
                        <Input 
                            type="file" 
                            className="hidden"
                            ref={fileInputRef}
                            accept="video/*"
                            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                        />
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Video
                        </Button>
                    </div>
                </FormControl>
                 <FormDescription>
                    {fileName ? `Selected file: ${fileName}` : "Select a video file to upload."}
                  </FormDescription>
                <FormMessage />
            </FormItem>
            
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
        </div>


        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Adding...' : 'Add Class'}
        </Button>
      </form>
    </Form>
  );
}
