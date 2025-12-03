'use client';
import { notFound } from 'next/navigation';
import { CourseDetailClient } from './page-client';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import type { Course } from '@/lib/data';
import { collection, getDocs, query, doc, Firestore } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Course as CourseSchema, Lecture as LectureSchema } from '@/lib/schema';

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');


async function getCourseBySlugClient(
  slug: string,
  fetchLectures: boolean = true,
  firestore: Firestore
): Promise<Course | undefined> {
  const coursesRef = collection(firestore, 'courses');
  const q = query(coursesRef);
  const querySnapshot = await getDocs(q);

  for (const docRef of querySnapshot.docs) {
    const data = docRef.data() as CourseSchema;
    if (slugify(data.title) === slug) {
      const image = PlaceHolderImages.find((img) => img.id === data.imageId);
      
      let lectures: any[] = [];
      if (fetchLectures) {
        const lecturesSnapshot = await getDocs(collection(firestore, 'courses', docRef.id, 'lectures'));
        lectures = lecturesSnapshot.docs.map(lectureDoc => ({
          ...(lectureDoc.data() as LectureSchema),
          id: lectureDoc.id,
        }));
      }

      const author = data.author || 'TBD';

      return {
        ...data,
        id: docRef.id,
        slug: slugify(data.title),
        author,
        progress: 30,
        imageUrl: image?.imageUrl,
        imageHint: image?.imageHint,
        lectures: lectures.sort((a,b) => a.title.localeCompare(b.title)),
      };
    }
  }

  return undefined;
};


export default function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      if (firestore) {
        setLoading(true);
        const fetchedCourse = await getCourseBySlugClient(params.slug, true, firestore);
        if (!fetchedCourse) {
          notFound();
        }
        setCourse(fetchedCourse);
        setLoading(false);
      }
    }
    fetchCourse();
  }, [firestore, params.slug]);

  useEffect(() => {
    if (user) {
      setIsInstructor(user.email === 'codenexus199@gmail.com');
    }
  }, [user]);

  if (loading || !course) {
    return <div>Loading...</div>; // Or a proper skeleton loader
  }

  return <CourseDetailClient course={course} isInstructor={isInstructor} />;
}
