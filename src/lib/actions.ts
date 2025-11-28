'use server';
import { collection, doc, setDoc, Firestore, serverTimestamp, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Course, RecordedClass, LiveSession, Subscription } from './schema';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export async function createCourse(firestore: Firestore, courseData: Course) {
  try {
    const courseRef = doc(firestore, 'courses', courseData.id);
    await setDoc(courseRef, courseData);
  } catch (error: any) {
    const permissionError = new FirestorePermissionError({
      path: `courses/${courseData.id}`,
      operation: 'create',
      requestResourceData: courseData,
    });
    throw permissionError;
  }
}

export async function updateCourse(firestore: Firestore, courseId: string, courseData: Partial<Course>) {
    try {
        const courseRef = doc(firestore, 'courses', courseId);
        await updateDoc(courseRef, courseData);
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `courses/${courseId}`,
            operation: 'update',
            requestResourceData: courseData,
        });
        throw permissionError;
    }
}

export async function deleteCourse(firestore: Firestore, courseId: string) {
    try {
        const courseRef = doc(firestore, 'courses', courseId);
        await deleteDoc(courseRef);
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `courses/${courseId}`,
            operation: 'delete',
        });
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

export async function updateClass(firestore: Firestore, classId: string, classData: Partial<RecordedClass>) {
    try {
        const classRef = doc(firestore, 'classes', classId);
        await updateDoc(classRef, classData);
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `classes/${classId}`,
            operation: 'update',
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
    } catch (error: any)
{
        const permissionError = new FirestorePermissionError({
            path: `liveSessions`,
            operation: 'create',
            requestResourceData: sessionData,
        });
        throw permissionError;
    }
}

export async function createSubscription(firestore: Firestore, userId: string) {
    try {
        const subscriptionId = uuidv4();
        const subscriptionRef = doc(firestore, 'users', userId, 'subscriptions', subscriptionId);
        const now = new Date();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

        const subscriptionData: Subscription = {
            id: subscriptionId,
            userId,
            status: 'active',
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
        };

        await setDoc(subscriptionRef, subscriptionData);
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `users/${userId}/subscriptions/${subscriptionId}`,
            operation: 'create',
            requestResourceData: {}, // Don't expose sub data
        });
        throw permissionError;
    }
    revalidatePath('/billing');
    redirect('/billing');
}
