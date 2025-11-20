'use server';
import { collection, doc, setDoc, Firestore, serverTimestamp, addDoc } from 'firebase/firestore';
import type { Course, RecordedClass, LiveSession } from './schema';
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

export async function createClass(firestore: Firestore, classData: Omit<RecordedClass, 'createdAt'>) {
    try {
        const classRef = doc(firestore, 'classes', classData.id);
        const dataWithTimestamp = {
            ...classData,
            createdAt: serverTimestamp(),
        };
        await setDoc(classRef, dataWithTimestamp);
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `classes/${classData.id}`,
            operation: 'create',
            requestResourceData: classData,
        });
        throw permissionError;
    }
}

export async function startLiveSession(firestore: Firestore, sessionData: Omit<LiveSession, 'id' | 'scheduledTime'>) {
    try {
        const collectionRef = collection(firestore, 'liveSessions');
        const dataWithTimestamp = {
            ...sessionData,
            scheduledTime: serverTimestamp(),
        };
        // Using addDoc to let Firestore generate the ID
        const docRef = await addDoc(collectionRef, dataWithTimestamp);
        return docRef.id;
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `liveSessions`,
            operation: 'create',
            requestResourceData: sessionData,
        });
        throw permissionError;
    }
}
