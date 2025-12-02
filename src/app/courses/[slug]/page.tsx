'use server';
import { getCourseBySlug, type Course } from '@/lib/data';
import { notFound } from 'next/navigation';
import { getAdminDb } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { auth } from 'firebase-admin';
import { CourseDetailClient } from './page-client';

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

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const firestore = getAdminDb();
  const course = await getCourseBySlug(params.slug, true, firestore);

  if (!course) {
    notFound();
  }

  const isInstructor = await getIsInstructor();

  return <CourseDetailClient course={course} isInstructor={isInstructor} />;
}
