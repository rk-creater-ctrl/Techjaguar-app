'use server';

import { z } from 'zod';
import {
  getPersonalizedCourseRecommendations,
  type PersonalizedCourseRecommendationsOutput,
} from '@/ai/flows/personalized-course-recommendations';
import { getCourses } from '@/lib/data';

const schema = z.object({
  learningHistory: z.array(z.string()),
  interests: z.string().min(1, 'Please enter at least one interest.'),
  userPreferences: z.string(),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  data?: PersonalizedCourseRecommendationsOutput;
};

export async function getRecommendationsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    learningHistory: formData.getAll('learningHistory'),
    interests: formData.get('interests'),
    userPreferences: formData.get('userPreferences'),
  });

  if (!validatedFields.success) {
    const { fieldErrors } = validatedFields.error.flatten();
    return {
      message: 'Error: Invalid fields',
      fields: {
        interests: formData.get('interests')?.toString() ?? '',
        userPreferences: formData.get('userPreferences')?.toString() ?? '',
      },
      issues: validatedFields.error.issues.map((issue) => issue.message),
    };
  }

  try {
    const allCourses = await getCourses();
    const learningHistoryTitles = validatedFields.data.learningHistory.map(courseId => {
        const course = allCourses.find(c => c.id === courseId);
        return course ? course.title : courseId;
    });

    const result = await getPersonalizedCourseRecommendations({
        ...validatedFields.data,
        learningHistory: learningHistoryTitles,
    });
    
    // Enrich with full course data
    const recommendedCoursesData = result.recommendedCourses.map(title => {
        const found = allCourses.find(c => c.title.toLowerCase() === title.toLowerCase());
        return found || { id: title, title, slug: '#', description: 'Could not find details for this course.', author: 'N/A', progress: 0, isFree: true, lectures: [] };
    });

    return {
      message: 'success',
      data: {
        reasoning: result.reasoning,
        recommendedCourses: recommendedCoursesData as any, // The type is a bit tricky here
      },
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Error: Could not get recommendations from AI.',
    };
  }
}
