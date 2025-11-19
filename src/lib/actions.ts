'use server';
import { collection, doc, setDoc, Firestore } from 'firebase/firestore';
import type { Course } from './schema';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function createCourse(firestore: Firestore, courseData: Course) {
  const courseRef = doc(collection(firestore, 'courses'), courseData.id);
  
  // Use a non-blocking write with error handling
  setDoc(courseRef, courseData)
    .catch(error => {
      // Create a rich, contextual error and emit it globally
      const permissionError = new FirestorePermissionError({
        path: courseRef.path,
        operation: 'create',
        requestResourceData: courseData,
      });
      errorEmitter.emit('permission-error', permissionError);

      // Also, re-throw the original error if you want the promise to reject
      // This allows the calling UI to handle the error state locally if needed
      throw error; 
    });
}
