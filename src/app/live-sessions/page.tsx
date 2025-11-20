'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
  } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Radio, Lock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useUser } from '@/firebase';

const liveSessions = [
    { id: '1', title: 'Live Q&A: Advanced React State Management', description: 'Join our expert instructor for a live Q&A session on advanced state management patterns in React.', scheduledTime: '2024-08-15T14:00:00Z', isFree: true },
    { id: '2', title: 'Premium Workshop: Building a Full-Stack Next.js App', description: 'A 3-hour deep-dive workshop into building and deploying a complete application.', scheduledTime: '2024-08-20T10:00:00Z', isFree: false },
    { id: '3', title: 'Community Hangout: Tech Talk & Networking', description: 'A casual, free-for-all session to discuss the latest in tech and meet fellow learners.', scheduledTime: '2024-08-22T18:00:00Z', isFree: true },
    { id: '4', title: 'Premium Code Review: Project Showcase', description: 'Get your personal project reviewed live by an industry professional. Limited spots.', scheduledTime: '2024-08-25T16:00:00Z', isFree: false },
];


function SessionCard({ session }: { session: (typeof liveSessions)[0] }) {
  const scheduledDate = new Date(session.scheduledTime);
  
  return (
    <Card className="flex flex-col">
       {!session.isFree && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-primary hover:bg-primary">
            <Lock className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline">{session.title}</CardTitle>
        <CardDescription>{session.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
         <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{scheduledDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
         </div>
      </CardContent>
      <CardFooter>
        <Button disabled={!session.isFree}>
            {session.isFree ? 'Join Now' : 'Upgrade to Join'}
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function LiveSessionsPage() {
    const { user } = useUser();
    const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;

    const freeSessions = liveSessions.filter((s) => s.isFree);
    const premiumSessions = liveSessions.filter((s) => !s.isFree);
  
    const SessionGrid = ({ sessions }: { sessions: typeof liveSessions }) => (
      <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
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
              Join live events, workshops, and Q&A sessions.
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
  
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <SessionGrid sessions={liveSessions} />
          </TabsContent>
          <TabsContent value="free">
            <SessionGrid sessions={freeSessions} />
          </TabsContent>
          <TabsContent value="premium">
            <SessionGrid sessions={premiumSessions} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
