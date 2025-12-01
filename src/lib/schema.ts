'use client';
// Defines the database schema for the application
// See: https://firebase.google.com/docs/firestore/manage-data/structure-data

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  author: string; // denormalized instructor name
  categoryId: string;
  price: number;
  isFree: boolean;
  imageId: string;
  materialsUrl?: string;
}

export interface Lecture {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
  isFree: boolean;
}

export interface RecordedClass {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  instructorId: string;
  createdAt: any; // Firestore timestamp
  isFree: boolean;
}

export interface LiveSession {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    scheduledTime: any; // Firestore timestamp
    isFree: boolean;
    meetingUrl: string;
}

export interface Subscription {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}
