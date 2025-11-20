'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Radio } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';

export default function LiveSessionsPage() {
  const { user } = useUser();
  const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;

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
            <Link href="/studio/new-session">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Session
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg mt-4">
        <Radio className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No Live Sessions Scheduled</h3>
        <p className="text-muted-foreground">
          Check back soon for upcoming live events.
        </p>
      </div>
    </div>
  );
}