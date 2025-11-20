'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Video } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';

export default function ClassesPage() {
  const { user } = useUser();
  const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;
  const recordedClasses: any[] = []; // No classes by default

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Video className="h-8 w-8 text-accent" />
            Recorded Classes
          </h1>
          <p className="text-muted-foreground">
            Catch up on past live sessions and workshops.
          </p>
        </div>
        {isInstructor && (
          <div className="flex items-center space-x-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </div>
        )}
      </div>
      <div className="grid gap-6">
        {recordedClasses.length > 0 &&
          recordedClasses.map((rec: any) => (
            <Card key={rec.id}>
              <CardHeader>
                <CardTitle className="font-headline hover:underline">
                  <a href={rec.url}>{rec.title}</a>
                </CardTitle>
                <CardDescription>
                  Taught by {rec.instructor} on{' '}
                  {new Date(rec.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Duration: {rec.duration}
                </p>
              </CardContent>
            </Card>
          ))}
        {recordedClasses.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Recorded Classes Available</h3>
            <p className="text-muted-foreground">
              {isInstructor
                ? 'Click "Add Video" to upload a new class.'
                : 'Check back later for recordings of live sessions.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
