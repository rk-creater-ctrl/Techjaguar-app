'use server';

/**
 * @fileOverview Provides personalized course recommendations based on user learning history,
 * interests, and the learning patterns of similar users.
 *
 * - getPersonalizedCourseRecommendations - A function that returns personalized course recommendations.
 * - PersonalizedCourseRecommendationsInput - The input type for the getPersonalizedCourseRecommendations function.
 * - PersonalizedCourseRecommendationsOutput - The return type for the getPersonalizedCourseRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedCourseRecommendationsInputSchema = z.object({
  learningHistory: z
    .array(z.string())
    .describe('List of course IDs the user has already completed or is enrolled in.'),
  interests: z.string().describe('A comma separated list of the user interests.'),
  userPreferences: z
    .string()
    .describe('Any specific learning preferences the user has, e.g., visual, auditory, etc.'),
});

export type PersonalizedCourseRecommendationsInput = z.infer<
  typeof PersonalizedCourseRecommendationsInputSchema
>;

const PersonalizedCourseRecommendationsOutputSchema = z.object({
  recommendedCourses: z
    .array(z.string())
    .describe('List of course IDs recommended for the user.'),
  reasoning: z
    .string()
    .describe(
      'Explanation of why these courses were recommended, based on learning history, interests, and similar user patterns.'
    ),
});

export type PersonalizedCourseRecommendationsOutput = z.infer<
  typeof PersonalizedCourseRecommendationsOutputSchema
>;

export async function getPersonalizedCourseRecommendations(
  input: PersonalizedCourseRecommendationsInput
): Promise<PersonalizedCourseRecommendationsOutput> {
  return personalizedCourseRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedCourseRecommendationsPrompt',
  input: {schema: PersonalizedCourseRecommendationsInputSchema},
  output: {schema: PersonalizedCourseRecommendationsOutputSchema},
  prompt: `You are an AI course recommendation system. You will take into account the user's learning history, interests, and learning preferences to make personalized course recommendations.

Consider learning patterns of other similar users when generating recommendations.

Learning History: {{{learningHistory}}}
Interests: {{{interests}}}
User Preferences: {{{userPreferences}}}

Based on this information, recommend courses that would be most relevant and engaging for the user.

Explain your reasoning for each recommendation.
`,
});

const personalizedCourseRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedCourseRecommendationsFlow',
    inputSchema: PersonalizedCourseRecommendationsInputSchema,
    outputSchema: PersonalizedCourseRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
