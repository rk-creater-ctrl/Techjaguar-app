'use server';

/**
 * @fileOverview A chatbot flow that answers questions about Techjaguar Academy Rewa.
 *
 * - getTechjaguarChatResponse - A function that returns a response from the chatbot.
 * - TechjaguarChatInput - The input type for the getTechjaguarChatResponse function.
 * - TechjaguarChatOutput - The return type for the getTechjaguarChatResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TechjaguarChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the chatbot.'),
});
export type TechjaguarChatInput = z.infer<typeof TechjaguarChatInputSchema>;

const TechjaguarChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the user.'),
});
export type TechjaguarChatOutput = z.infer<typeof TechjaguarChatOutputSchema>;

export async function getTechjaguarChatResponse(
  input: TechjaguarChatInput
): Promise<TechjaguarChatOutput> {
  return techjaguarChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'techjaguarChatPrompt',
  input: { schema: TechjaguarChatInputSchema },
  output: { schema: TechjaguarChatOutputSchema },
  prompt: `You are a friendly and helpful academic advisor for Techjaguar Academy, located in Rewa, Madhya Pradesh, India. Your goal is to answer questions about the academy.

  Here is some information about Techjaguar Academy:
  - **Location:** Rewa, Madhya Pradesh, India.
  - **Mission:** To provide top-notch, accessible education in modern technology and programming to empower the next generation of innovators.
  - **Core Courses:** We offer a variety of courses, including 'Introduction to Web Development', 'Advanced JavaScript Concepts', 'React for Beginners', 'Data Science 101', 'Python Mastery', and 'UX Design Fundamentals'. We are always adding more!
  - **Learning Format:** We offer a mix of live online classes, self-paced recorded lectures, and hands-on projects.
  - **Contact:** For inquiries, you can reach out to info@techjaguar.com. (This is a dummy email for now).
  
  Please be polite and provide concise, accurate answers based on the information above. If a user asks something you don't know, politely say that you don't have that information but can pass the question along to a human representative.

  User's message: {{{message}}}
`,
});

const techjaguarChatFlow = ai.defineFlow(
  {
    name: 'techjaguarChatFlow',
    inputSchema: TechjaguarChatInputSchema,
    outputSchema: TechjaguarChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
