'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateClassForm } from './create-class-form';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function CreateClassPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const isInstructor = user?.email === process.env.NEXT_PUBLIC_INSTRUCTOR_EMAIL;

  useEffect(() => {
    if (!isUserLoading && !isInstructor) {
      // Redirect non-instructors away
      router.replace('/classes');
    }
  }, [isUserLoading, isInstructor, router]);

  if (isUserLoading) {
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
            <CardTitle className="font-headline">Add a New Recorded Class</CardTitle>
            <CardDescription>
              Fill out the details below to add a new video to the classes section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateClassForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
