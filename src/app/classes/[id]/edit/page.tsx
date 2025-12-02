'use server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateClassForm } from '@/app/classes/new/create-class-form';
import { notFound } from 'next/navigation';
import { getClassById } from '@/lib/data';
import { getAdminDb } from '@/firebase/admin';

export default async function EditClassPage({
  params,
}: {
  params: { id: string };
}) {
  const firestore = getAdminDb();
  const classItem = await getClassById(params.id, firestore);

  if (!classItem) {
    notFound();
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
            <CreateClassForm classItem={classItem} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
