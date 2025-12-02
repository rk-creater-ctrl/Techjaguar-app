'use server';
import { CourseCard } from '@/components/course-card';
import { getCourses, type Course } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { getAdminDb } from '@/firebase/admin';
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { PageClient } from './page-client';

async function getIsInstructor() {
  try {
    const sessionCookie = cookies().get('__session')?.value || '';
    const decodedClaims = await auth().verifySessionCookie(sessionCookie, true);
    return decodedClaims.email === 'codenexus199@gmail.com';
  } catch (error) {
    return false;
  }
}

export default async function CoursesPage() {
  const firestore = getAdminDb();
  const courses = await getCourses(firestore);
  const isInstructor = await getIsInstructor();

  return <PageClient courses={courses} isInstructor={isInstructor} />;
}
