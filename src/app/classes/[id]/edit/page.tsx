'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateClassForm } from '@/app/classes/new/create-class-form';
import { useFirestore, useUser } from '@/firebase';
import { useRouter, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getClassById } from '@/lib/data';
import type { RecordedClass } from '@/lib/schema';
import { Loader2 } from 'lucide-react';

export default function EditClassPage({ params }: { params: { id: string }}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [classItem, setClassItem] = useState<(RecordedClass & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  // In a real app, this would be a custom claim or role from your database.
  const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;

  useEffect(() => {
    const fetchClass = async () => {
      if (!firestore) return;
      setLoading(true);
      const fetchedClass = await getClassById(firestore, params.id);
      if (fetchedClass) {
        setClassItem(fetchedClass);
      } else {
        notFound();
      }
      setLoading(false);
    };

    fetchClass();
  }, [firestore, params.id]);

  useEffect(() => {
    if (!isUserLoading && !isInstructor) {
      // Redirect non-instructors away
      router.replace('/classes');
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
            <CardTitle className="font-headline">Edit Recorded Class</CardTitle>
            <CardDescription>
              Update the details for your recorded class below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateClassForm classItem={classItem as RecordedClass & { id: string }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
