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
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { collection } from 'firebase/firestore';
import type { RecordedClass } from '@/lib/schema';

function ClassCard({ classItem }: { classItem: WithId<RecordedClass> }) {
  // In a real app you might have a dedicated page for each class
  // For now, we link directly to the video if the URL exists.
  const videoUrl = classItem.videoUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline hover:underline">
          {videoUrl ? (
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              {classItem.title}
            </a>
          ) : (
            <span>{classItem.title}</span>
          )}
        </CardTitle>
        <CardDescription>
          {classItem.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
          {videoUrl ? (
             <iframe
                className="w-full h-full rounded-md"
                src={videoUrl.replace("watch?v=", "embed/")} // Basic transform for YouTube links
                title={classItem.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
          ) : (
            <Video className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function ClassesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;
  
  const classesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'classes');
  }, [firestore]);

  const { data: recordedClasses, isLoading } = useCollection<RecordedClass>(classesQuery);

  const LoadingSkeleton = () => (
    <div className="grid gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full aspect-video rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
            <Link href="/classes/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid gap-6">
          {recordedClasses && recordedClasses.length > 0 ? (
            recordedClasses.map((rec: WithId<RecordedClass>) => (
              <ClassCard key={rec.id} classItem={rec} />
            ))
          ) : (
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
      )}
    </div>
  );
}
