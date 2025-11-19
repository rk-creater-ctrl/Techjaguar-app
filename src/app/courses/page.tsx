'use client';
import { CourseCard } from '@/components/course-card';
import { getCourses, type Course } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesPage() {
  const firestore = useFirestore();
  const { user } = useUser(); // We'll use this to check for instructor role later
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // For now, we'll just use a mock instructor check.
  // In a real app, this would come from custom claims or a user role in Firestore.
  const isInstructor = !!user; 

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const fetchedCourses = await getCourses(firestore);
      setCourses(fetchedCourses);
      setLoading(false);
    };

    if (firestore) {
      fetchCourses();
    }
  }, [firestore]);


  const freeCourses = courses.filter((course) => course.isFree);
  const premiumCourses = courses.filter((course) => !course.isFree);

  const CourseGrid = ({ courses }: { courses: Course[] }) => (
    <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
  
  const LoadingSkeleton = () => (
     <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
         <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  )


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Explore Courses
          </h1>
          <p className="text-muted-foreground">
            Find your next learning adventure from our extensive catalog.
          </p>
        </div>
        {isInstructor && (
          <div className="flex items-center space-x-2">
            <Link href="/courses/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Course
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
          {loading ? <LoadingSkeleton /> : <CourseGrid courses={courses} />}
        </TabsContent>
        <TabsContent value="free">
          {loading ? <LoadingSkeleton /> : <CourseGrid courses={freeCourses} />}
        </TabsContent>
        <TabsContent value="premium">
          {loading ? <LoadingSkeleton /> : <CourseGrid courses={premiumCourses} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
