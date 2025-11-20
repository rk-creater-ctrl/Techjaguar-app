'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CourseForm } from './create-course-form';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateCoursePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // In a real app, this would be a custom claim or role from your database.
  const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;

  useEffect(() => {
    if (!isUserLoading && !isInstructor) {
      // Redirect non-instructors away
      router.replace('/courses');
    }
  }, [isUserLoading, isInstructor, router]);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isInstructor) {
     return null; // Or show an access denied message
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Create a New Course</CardTitle>
            <CardDescription>
              Fill out the details below to create a new course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
