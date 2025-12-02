'use server';
import { getAdminDb } from '@/firebase/admin';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { RecordedClass } from '@/lib/schema';
import { cookies } from 'next/headers';
import { auth } from 'firebase-admin';
import { ClassesPageClient } from './page-client';

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

async function getClasses() {
  const firestore = getAdminDb();
  const classesQuery = query(
    collection(firestore, 'classes'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(classesQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (RecordedClass & { id: string })[];
}

export default async function ClassesPage() {
  const recordedClasses = await getClasses();
  const isInstructor = await getIsInstructor();

  return (
    <ClassesPageClient
      recordedClasses={recordedClasses}
      isInstructor={isInstructor}
    />
  );
}
