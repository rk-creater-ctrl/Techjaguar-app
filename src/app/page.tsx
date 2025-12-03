'use client';
import { PageClient } from './page-client';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { getCoursesClient } from '@/lib/client-data';
import type { Course } from '@/lib/data';

export default function Dashboard() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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


  const clientUser = user
    ? { displayName: user.displayName || undefined, email: user.email || undefined }
    : null;
    
  if (loading) {
      // You can return a loading skeleton here if you want
      return <PageClient courses={[]} user={clientUser} />;
  }

  return <PageClient courses={courses} user={clientUser} />;
}
