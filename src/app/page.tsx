'use server';
import { getCourses, type Course } from '@/lib/data';
import { cookies } from 'next/headers';
import { auth } from 'firebase-admin';
import { PageClient } from './page-client';
import { getAdminDb } from '@/firebase/admin';

async function getUserSession() {
  try {
    const sessionCookie = cookies().get('__session')?.value || '';
    if (!sessionCookie) return null;
    const decodedClaims = await auth(getAdminDb().app).verifySessionCookie(
      sessionCookie,
      true
    );
    return decodedClaims;
  } catch (error) {
    // Session cookie is invalid or expired.
    // This is an expected condition during normal app use.
    // For example, after a user signs out.
    // console.error('Error verifying session cookie:', error);
    return null;
  }
}

export default async function Dashboard() {
  const firestore = getAdminDb();
  const courses = await getCourses(firestore);
  const session = await getUserSession();

  const user = session
    ? { displayName: session.name, email: session.email }
    : null;

  return <PageClient courses={courses} user={user} />;
}
