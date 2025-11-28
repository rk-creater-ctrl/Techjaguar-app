'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Video, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { collection } from 'firebase/firestore';
import type { RecordedClass } from '@/lib/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


function ClassCard({ classItem, isInstructor }: { classItem: WithId<RecordedClass>, isInstructor: boolean }) {
  const videoUrl = classItem.videoUrl;

  const CardWrapper = ({ children }: { children: React.ReactNode }) =>
    classItem.isFree ? (
      <div className="block hover:shadow-lg transition-shadow duration-300 h-full group">
        {children}
      </div>
    ) : (
      <Link href="/billing" className="relative h-full block hover:shadow-lg transition-shadow duration-300 group">
        {children}
      </Link>
    );


  return (
     <CardWrapper>
        <Card className="overflow-hidden h-full flex flex-col">
          <CardHeader>
             <div className="flex justify-between items-start">
                <CardTitle className="font-headline group-hover:underline pr-4">
                  {classItem.title}
                </CardTitle>
                {!classItem.isFree && (
                    <Badge variant="default" className="bg-primary hover:bg-primary whitespace-nowrap">
                        <Lock className="w-3 h-3 mr-1" />
                        PRO
                    </Badge>
                )}
             </div>
            <CardDescription>
              {classItem.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              {videoUrl ? (
                 <iframe
                    className="w-full h-full rounded-md pointer-events-none"
                    src={videoUrl.replace("watch?v=", "embed/")} 
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
          {isInstructor && (
            <CardFooter>
                <Link href={`/classes/${classItem.id}/edit`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Class
                    </Button>
                </Link>
            </CardFooter>
          )}
        </Card>
     </CardWrapper>
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

  const freeClasses = recordedClasses?.filter((c) => c.isFree) || [];
  const premiumClasses = recordedClasses?.filter((c) => !c.isFree) || [];

  const ClassGrid = ({ classes }: { classes: WithId<RecordedClass>[] }) => (
    <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.length > 0 ? (
            classes.map((rec: WithId<RecordedClass>) => (
            <ClassCard key={rec.id} classItem={rec} isInstructor={isInstructor} />
            ))
        ) : (
            <div className="md:col-span-2 lg:col-span-3">
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                    <Video className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Classes Found</h3>
                    <p className="text-muted-foreground">
                        There are no classes in this category yet.
                    </p>
                </div>
            </div>
        )}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
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
                Add Class
              </Button>
            </Link>
          </div>
        )}
      </div>
      
       <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? <LoadingSkeleton /> : <ClassGrid classes={recordedClasses || []} />}
        </TabsContent>
        <TabsContent value="free">
          {isLoading ? <LoadingSkeleton /> : <ClassGrid classes={freeClasses} />}
        </TabsContent>
        <TabsContent value="premium">
          {isLoading ? <LoadingSkeleton /> : <ClassGrid classes={premiumClasses} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
