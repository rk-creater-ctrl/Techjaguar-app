'use server';
import { getCourses, type Course } from '@/lib/data';
import { cookies } from 'next/headers';
import { auth } from 'firebase-admin';
import { PageClient } from './page-client';

async function getUserSession() {
  try {
    const sessionCookie = cookies().get('__session')?.value || '';
    const decodedClaims = await auth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export default async function Dashboard() {
  const courses = await getCourses();
  const session = await getUserSession();

  const user = session ? { displayName: session.name, email: session.email } : null;

  return <PageClient courses={courses} user={user} />;
}
