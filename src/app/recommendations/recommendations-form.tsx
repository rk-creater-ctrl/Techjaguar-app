'use client';

import { useActionState, useEffect, useState } from 'react';
import { getRecommendationsAction, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { CourseCard } from '@/components/course-card';
import { getCourses, type Course } from '@/lib/data';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseOption {
  value: string;
  label: string;
}

const formSchema = z.object({
  learningHistory: z.array(z.string()).default([]),
  interests: z.string().min(3, 'Please describe your interests.'),
  userPreferences: z.string(),
});

export function RecommendationsForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    getRecommendationsAction,
    { message: '' }
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!firestore) return;
      setLoading(true);
      const fetchedCourses = await getCourses(firestore);
      setCourses(fetchedCourses);
      setCourseOptions(
        fetchedCourses.map((course) => ({
          value: course.id,
          label: course.title,
        }))
      );
      setLoading(false);
    };

    fetchCourses();
  }, [firestore]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      learningHistory: [],
      interests: '',
      userPreferences: '',
    },
  });

  useEffect(() => {
    if (state.message === 'success') {
      // form.reset(); // Optionally reset form on success
    }
  }, [state, form]);

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    // Append the full courses list to the form data for the server action
    formData.append('allCourses', JSON.stringify(courses));
    form.trigger().then((isValid) => {
      if (isValid) {
        formAction(formData);
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <Skeleton className="h-8 w-1/2" />
             <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
             <Skeleton className="h-8 w-1/3 mt-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
         <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="learningHistory"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base font-headline">
                        Your Learning History
                      </FormLabel>
                      <FormDescription>
                        Select courses you have already completed.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {courseOptions.map((course) => (
                        <FormField
                          key={course.value}
                          control={form.control}
                          name="learningHistory"
                          render={({ field }) => (
                            <FormItem
                              key={course.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  name="learningHistory"
                                  value={course.value}
                                  checked={field.value?.includes(course.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          course.value,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== course.value
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {course.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-headline">
                      Your Interests
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="e.g., 'Building interactive UIs with React, data visualization, game development with Python...'"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Describe topics, skills, or hobbies you're passionate
                      about.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-headline">
                      Learning Preferences (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 'Prefer project-based learning', 'Visual learner', 'Like short videos'"
                      />
                    </FormControl>
                    <FormDescription>
                      Any preferences you have for how you like to learn?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Analyzing...' : 'Get Recommendations'}
          </Button>
        </form>
      </Form>

      {state.message === 'success' && state.data && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold tracking-tight font-headline mb-4">
            Your Personalized Recommendations
          </h3>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle className="font-headline">AI Reasoning</AlertTitle>
            <AlertDescription>{state.data.reasoning}</AlertDescription>
          </Alert>
          <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
            {(state.data.recommendedCourses as unknown as Course[]).map(
              (course) => (
                <CourseCard key={course.id} course={course} />
              )
            )}
          </div>
        </div>
      )}
      {state.message && state.message.startsWith('Error') && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
