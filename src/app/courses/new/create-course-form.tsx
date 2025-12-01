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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useStorage } from '@/firebase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createCourse, updateCourse } from '@/lib/actions';
import { v4 as uuidv4 } from 'uuid';
import type { Course } from '@/lib/schema';
import React, { useRef, useState, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadFile, type UploadProgress } from '@/lib/storage';
import { Progress } from '@/components/ui/progress';

const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.'),
  isFree: z.boolean().default(false),
  imageId: z.string({
    required_error: 'Please select an image.',
  }),
  materialsUrl: z.string().url().optional().or(z.literal('')),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CreateCourseFormProps {
  course?: Course;
}

export function CourseForm({ course }: CreateCourseFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadProgress | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const isEditing = !!course;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: isEditing ? {
      title: course.title,
      description: course.description,
      price: course.price,
      isFree: course.isFree,
      imageId: course.imageId,
      materialsUrl: course.materialsUrl,
    } : {
      title: '',
      description: '',
      price: 29.99,
      isFree: false,
      materialsUrl: '',
    },
  });
  
  const isFree = form.watch('isFree');
  
  const handleUploadProgress = useCallback((progress: UploadProgress) => {
    setUploadState(progress);
    if (progress.status === 'success' && progress.downloadURL) {
      form.setValue('materialsUrl', progress.downloadURL);
    }
  }, [form]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && storage) {
      setFileName(file.name);
      setUploadState({ progress: 0, status: 'uploading' });
      uploadFile(storage, 'course-materials', file, handleUploadProgress);
    }
  };

  const onSubmit = async (data: CourseFormValues) => {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to perform this action.',
        });
        return;
    }

    const finalData = {
        ...data,
        price: data.isFree ? 0 : data.price,
    };

    try {
      if (isEditing && course.id) {
        await updateCourse(firestore, course.id, {
          ...finalData,
          author: user.displayName || 'Unnamed Instructor',
        });
        toast({
          title: 'Course Updated',
          description: 'The course has been updated successfully.',
        });
      } else {
        await createCourse(firestore, {
          ...finalData,
          id: uuidv4(),
          instructorId: user.uid,
          categoryId: 'general', // Placeholder
          author: user.displayName || 'Unnamed Instructor',
        });
        toast({
          title: 'Course Created',
          description: 'The course has been created successfully.',
        });
      }
      
      router.push('/courses');
      router.refresh();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not save course.',
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
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Introduction to Next.js 14"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A catchy and descriptive title for your course.
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
              <FormLabel>Course Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what students will learn in this course..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cover image" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PlaceHolderImages.map((image) => (
                    <SelectItem key={image.id} value={image.id}>
                      {image.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose an image that represents your course.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Course Materials (PDF)</FormLabel>
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
                            {course?.materialsUrl ? 'Replace PDF file' : 'Click to browse or drag & drop'}
                        </p>
                      </>
                    )}
                </div>
                <Input 
                    ref={fileInputRef}
                    type="file" 
                    className="sr-only"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={uploadState?.status === 'uploading'}
                />
            </div>
          </FormControl>
          <FormDescription>
            {uploadState?.status === 'success' && form.getValues('materialsUrl') && 
              <a href={form.getValues('materialsUrl')} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View uploaded file</a>
            }
          </FormDescription>
          <FormMessage />
        </FormItem>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Free Course</FormLabel>
                  <FormDescription>
                    Is this course available for free?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        form.setValue('price', 0);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {!isFree && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 29.99" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set the price for your course in USD.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting || uploadState?.status === 'uploading'}>
          {form.formState.isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Course')}
        </Button>
      </form>
    </Form>
  );
}
