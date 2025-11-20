
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Video } from 'lucide-react';

// Mock data for now. In the future, this will come from Firestore.
const recordedClasses = [
    {
        id: '1',
        title: 'Live Session: Advanced React Patterns',
        instructor: 'Dr. Evelyn Reed',
        date: '2024-05-20',
        duration: '1:25:30',
        url: '#',
    },
    {
        id: '2',
        title: 'Live Q&A: Data Science Fundamentals',
        instructor: 'Dr. Evelyn Reed',
        date: '2024-05-18',
        duration: '0:55:10',
        url: '#',
    },
    {
        id: '3',
        title: 'Workshop: Building a REST API with Node.js',
        instructor: 'Dr. Evelyn Reed',
        date: '2024-05-15',
        duration: '2:10:05',
        url: '#',
    }
]

export default function ClassesPage() {
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
      </div>
      <div className="grid gap-6">
        {recordedClasses.map((rec) => (
            <Card key={rec.id}>
                <CardHeader>
                    <CardTitle className="font-headline hover:underline">
                        <a href={rec.url}>{rec.title}</a>
                    </CardTitle>
                    <CardDescription>
                        Taught by {rec.instructor} on {new Date(rec.date).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Duration: {rec.duration}</p>
                </CardContent>
            </Card>
        ))}
        {recordedClasses.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Recorded Classes Available</h3>
                <p className="text-muted-foreground">
                    Check back later for recordings of live sessions.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
