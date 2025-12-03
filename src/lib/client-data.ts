'use client';

import { collection, getDocs, Firestore } from 'firebase/firestore';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import type { Course as CourseSchema } from './schema';
import type { Course } from './data';

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

/**
 * Fetches courses using the client-side Firestore instance.
 * This function is safe to use in client components.
 */
export const getCoursesClient = async (db: Firestore): Promise<Course[]> => {
  const coursesCol = collection(db, 'courses');
  const courseSnapshot = await getDocs(coursesCol);
  const courseList = courseSnapshot.docs.map((doc) => {
    const data = doc.data() as CourseSchema;
    const image = PlaceHolderImages.find((img) => img.id === data.imageId);
    return {
      ...data,
      id: doc.id,
      slug: slugify(data.title),
      // Mock data for now, will be replaced with real data
      progress: Math.random() > 0.5 ? Math.floor(Math.random() * 80) : 0,
      imageUrl: image?.imageUrl,
      imageHint: image?.imageHint,
      lectures: [],
    };
  });
  return courseList;
};
