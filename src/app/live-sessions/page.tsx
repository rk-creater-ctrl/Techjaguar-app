'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Radio, Users } from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { LiveSession } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function LiveSessionCard({ session }: { session: WithId<LiveSession> }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">{session.title}</CardTitle>
        <CardDescription>
          Join this exclusive live session with our instructors.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Live Now
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
           <Link href={session.isFree ? session.meetingUrl : '/billing'} target={session.isFree ? '_blank' : '_self'}>
             {session.isFree ? (
                <>
                  <Radio className="mr-2 h-4 w-4" />
                  Join Now
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Upgrade to Join
                </>
              )}
           </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function LiveSessionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const isInstructor = user?.email === process.env.NEXT_PUBLIC_INSTRUCTOR_EMAIL;
  
  const liveSessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'liveSessions');
  }, [firestore]);

  const { data: liveSessions, isLoading } = useCollection<LiveSession>(liveSessionsQuery);


  const LoadingSkeleton = () => (
    <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-5 w-20" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Radio className="h-8 w-8 text-accent" />
            Live Sessions
          </h1>
          <p className="text-muted-foreground">
            Join exclusive live events, workshops, and Q&A sessions.
          </p>
        </div>
        {isInstructor && (
          <div className="flex items-center space-x-2">
            <Link href="/studio">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </Link>
          </div>
        )}
      </div>

      {isLoading ? <LoadingSkeleton /> : (
        liveSessions && liveSessions.length > 0 ? (
          <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
            {liveSessions.map((session) => (
              <LiveSessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg mt-4">
            <Radio className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Live Sessions Currently Active</h3>
            <p className="text-muted-foreground">
              Check back soon for upcoming live events.
            </p>
          </div>
        )
      )}
    </div>
  );
}
