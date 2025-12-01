'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CourseForm } from '@/app/courses/new/create-course-form';
import { useFirestore, useUser } from '@/firebase';
import { useRouter, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCourseBySlug } from '@/lib/data';
import type { Course } from '@/lib/schema';
import { Loader2 } from 'lucide-react';

export default function EditCoursePage({ params }: { params: { slug: string }}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.email === 'codenexus199@gmail.com';

  useEffect(() => {
    const fetchCourse = async () => {
      if (!firestore) return;
      setLoading(true);
      const fetchedCourse = await getCourseBySlug(firestore, params.slug, false); // Don't fetch lectures
      if (fetchedCourse) {
        setCourse(fetchedCourse as Course);
      } else {
        notFound();
      }
      setLoading(false);
    };

    fetchCourse();
  }, [firestore, params.slug]);

  useEffect(() => {
    if (!isUserLoading && !isInstructor) {
      // Redirect non-instructors away
      router.replace('/courses');
    }
  }, [isUserLoading, isInstructor, router]);

  if (isUserLoading || loading) {
    return (
       <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
       </div>
    );
  }
  
  if (!isInstructor) {
     return null; // Or show an access denied message
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Edit Course</CardTitle>
            <CardDescription>
              Update the details for your course below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseForm course={course as Course} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
