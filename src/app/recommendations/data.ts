'use server';

import { getCourses as getCoursesFromLib } from '@/lib/data';
import { unstable_cache } from 'next/cache';

// This function is a client-side callable server action to fetch courses.
// It uses unstable_cache to cache the results.
export const getCourses = unstable_cache(
  async () => {
    return getCoursesFromLib();
  },
  ['courses_for_recommendations'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
);
