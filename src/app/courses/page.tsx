'use client';
import { getCoursesClient } from '@/lib/client-data';
import { PageClient } from './page-client';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import type { Course } from '@/lib/data';

export default function CoursesPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      if (firestore) {
        setLoading(true);
        const fetchedCourses = await getCoursesClient(firestore);
        setCourses(fetchedCourses);
        setLoading(false);
      }
    }
    fetchCourses();
  }, [firestore]);

  useEffect(() => {
    if (user) {
      setIsInstructor(user.email === 'codenexus199@gmail.com');
    }
  }, [user]);

  if (loading) {
    // You can return a loading skeleton here if you want
    return <PageClient courses={[]} isInstructor={isInstructor} />;
  }

  return <PageClient courses={courses} isInstructor={isInstructor} />;
}
