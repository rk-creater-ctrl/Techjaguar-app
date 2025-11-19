'use server';
import { collection, doc, setDoc, Firestore } from 'firebase/firestore';
import type { Course } from './schema';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function createCourse(firestore: Firestore, courseData: Course) {
  try {
    const courseRef = doc(firestore, 'courses', courseData.id);
    await setDoc(courseRef, courseData);
  } catch (error: any) {
    // Create a rich, contextual error. In a server action, we can't emit
    // to the client-side emitter, so we'll re-throw a more informative error.
    const permissionError = new FirestorePermissionError({
      path: `courses/${courseData.id}`,
      operation: 'create',
      requestResourceData: courseData,
    });
    
    // We're throwing the custom error so the UI can catch and display it.
    throw permissionError;
  }
}
