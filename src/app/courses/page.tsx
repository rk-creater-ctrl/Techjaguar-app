'use server';
import { getCourses } from '@/lib/data';
import { getAdminDb } from '@/firebase/admin';
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { PageClient } from './page-client';

async function getIsInstructor() {
  try {
    const sessionCookie = cookies().get('__session')?.value || '';
    if (!sessionCookie) return false;
    const decodedClaims = await auth(getAdminDb().app).verifySessionCookie(
      sessionCookie,
      true
    );
    return decodedClaims.email === 'codenexus199@gmail.com';
  } catch (error) {
    return false;
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();
  const isInstructor = await getIsInstructor();

  return <PageClient courses={courses} isInstructor={isInstructor} />;
}
