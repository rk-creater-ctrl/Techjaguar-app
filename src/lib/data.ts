'use server';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type {
  Course as CourseSchema,
  Lecture as LectureSchema,
  RecordedClass as RecordedClassSchema,
} from './schema';
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  Firestore,
} from 'firebase/firestore';
import { getAdminDb } from '@/firebase/admin';
import { getSubscriptionByUserId as getMockSubscription } from './mock-data';

export interface Lecture extends LectureSchema {
  // any additional client-side properties can be added here
}

export interface Course extends CourseSchema {
  slug: string;
  progress: number; // 0-100
  imageUrl?: string;
  imageHint?: string;
  lectures: Lecture[];
}

export interface Subscription {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'cancelled';
}

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const getCourses = async (): Promise<Course[]> => {
  const firestore = getAdminDb();
  const coursesCol = collection(firestore, 'courses');
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

export const getCourseBySlug = async (
  slug: string,
  fetchLectures: boolean = true
): Promise<Course | undefined> => {
  const firestore = getAdminDb();
  const coursesRef = collection(firestore, 'courses');
  const q = query(coursesRef);
  const querySnapshot = await getDocs(q);

  for (const docRef of querySnapshot.docs) {
    const data = docRef.data() as CourseSchema;
    if (slugify(data.title) === slug) {
      const image = PlaceHolderImages.find((img) => img.id === data.imageId);

      let lectures: Lecture[] = [];
      if (fetchLectures) {
        const lecturesSnapshot = await getDocs(
          collection(firestore, 'courses', docRef.id, 'lectures')
        );
        lectures = lecturesSnapshot.docs.map((lectureDoc) => ({
          ...(lectureDoc.data() as LectureSchema),
          id: lectureDoc.id,
        }));
      }

      return {
        ...data,
        id: docRef.id,
        slug: slugify(data.title),
        progress: 30,
        imageUrl: image?.imageUrl,
        imageHint: image?.imageHint,
        lectures: lectures.sort((a, b) => a.title.localeCompare(b.title)),
      };
    }
  }

  return undefined;
};

export const getSubscriptionByUserId = async (
  userId: string
): Promise<Subscription | undefined> => {
  // In a real app, you would fetch this from Firestore.
  // For now, we'll simulate it with a mock user.
  return getMockSubscription(userId);
};

export const getClassById = async (
  classId: string
): Promise<(RecordedClassSchema & { id: string }) | undefined> => {
  const firestore = getAdminDb();
  const classRef = doc(firestore, 'classes', classId);
  const docSnap = await getDoc(classRef);

  if (docSnap.exists()) {
    return {
      ...(docSnap.data() as RecordedClassSchema),
      id: docSnap.id,
    };
  } else {
    return undefined;
  }
};
