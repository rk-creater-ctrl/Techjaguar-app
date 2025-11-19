'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CourseCard } from '@/components/course-card';
import { getCourses } from '@/lib/data';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import type { Course } from '@/lib/data';

export default function Dashboard() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const coursesInProgress = courses.filter(
    (course) => course.progress > 0 && course.progress < 100
  );
  const featuredCourses = courses.slice(0, 4);

  const welcomeMessage = user?.displayName
    ? `Welcome back, ${user.displayName.split(' ')[0]}!`
    : 'Welcome back!';

  if (loading) {
    return (
       <div className="flex-1 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Loading...
        </h1>
       </div>
    )
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {welcomeMessage}
        </h1>
      </div>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight font-headline mb-4">
          Continue Learning
        </h2>
        {coursesInProgress.length > 0 ? (
          <Carousel
            opts={{
              align: 'start',
            }}
            className="w-full"
          >
            <CarouselContent>
              {coursesInProgress.map((course) => (
                <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <CourseCard course={course} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        ) : (
          <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              You haven't started any courses yet. Explore our courses to get
              started!
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight font-headline mb-4">
          Featured Courses
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
