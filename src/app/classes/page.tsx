'use client';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { RecordedClass } from '@/lib/schema';
import { ClassesPageClient } from './page-client';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import type { WithId } from '@/firebase/firestore/use-collection';


export default function ClassesPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [recordedClasses, setRecordedClasses] = useState<WithId<RecordedClass>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    async function getClasses() {
      if (firestore) {
        setLoading(true);
        const classesQuery = query(
          collection(firestore, 'classes'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(classesQuery);
        const classes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WithId<RecordedClass>[];
        setRecordedClasses(classes);
        setLoading(false);
      }
    }
    getClasses();
  }, [firestore]);

  useEffect(() => {
    if (user) {
      setIsInstructor(user.email === 'codenexus199@gmail.com');
    }
  }, [user]);

  if (loading) {
    return <ClassesPageClient recordedClasses={[]} isInstructor={isInstructor} />;
  }

  return (
    <ClassesPageClient
      recordedClasses={recordedClasses}
      isInstructor={isInstructor}
    />
  );
}
