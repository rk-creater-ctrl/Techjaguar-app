'use server';
import { getCourses } from '@/lib/data';
import { RecommendationsForm } from './recommendations-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { initializeFirebase } from '@/firebase';

export default async function RecommendationsPage() {
  const { firestore } = initializeFirebase();
  const courses = await getCourses(firestore);
  const courseOptions = courses.map((course) => ({
    value: course.id,
    label: course.title,
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-accent" />
            Personalized Recommendations
          </h1>
          <p className="text-muted-foreground">
            Let our AI find the perfect next course for you based on your learning style.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Find Your Next Course</CardTitle>
            <CardDescription>Tell us about your learning history and interests, and our AI will suggest courses tailored for you.</CardDescription>
        </CardHeader>
        <CardContent>
            <RecommendationsForm courses={courseOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
