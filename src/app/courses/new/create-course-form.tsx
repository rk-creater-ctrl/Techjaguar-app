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

const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.'),
  isFree: z.boolean().default(false),
  imageUrl: z.string().url('Please enter a valid image URL.'),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export function CreateCourseForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      isFree: false,
      imageUrl: '',
    },
  });
  
  const isFree = form.watch('isFree');

  const onSubmit = async (data: CourseFormValues) => {
    // This is where we will add the server action to save the data
    console.log(data);
    toast({
      title: 'Course Created (Simulated)',
      description: 'The course has been created successfully (simulation).',
    });
    // For now, let's just log it and navigate away
    router.push('/courses');
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
                <Input placeholder="e.g., Introduction to Next.js 14" {...field} />
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/course-image.png" {...field} />
              </FormControl>
              <FormDescription>
                A URL for the course's cover image.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    onCheckedChange={field.onChange}
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
                    <Input type="number" placeholder="e.g., 49.99" {...field} />
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

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Course'}
        </Button>
      </form>
    </Form>
  );
}
