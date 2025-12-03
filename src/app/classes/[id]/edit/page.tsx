'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateClassForm } from '@/app/classes/new/create-class-form';
import { notFound } from 'next/navigation';
import { getAdminDb } from '@/firebase/admin';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { RecordedClass } from '@/lib/schema';
import { Loader2 } from 'lucide-react';


export default async function EditClassPage({
  params,
}: {
  params: { id: string };
}) {
  const firestore = useFirestore();
  const [classItem, setClassItem] = useState<(RecordedClass & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
        if (!firestore) return;
        setLoading(true);
        const classRef = doc(firestore, 'classes', params.id);
        const docSnap = await getDoc(classRef);

        if (docSnap.exists()) {
            setClassItem({
                ...(docSnap.data() as RecordedClass),
                id: docSnap.id,
            });
        } else {
            notFound();
        }
        setLoading(false);
    }
    fetchClass();
  }, [firestore, params.id]);

  if (loading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
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
            <CreateClassForm classItem={classItem!} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
