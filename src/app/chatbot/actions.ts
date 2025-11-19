'use server';

import { z } from 'zod';
import { getTechjaguarChatResponse } from '@/ai/flows/techjaguar-chat-flow';

const schema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

export type FormState = {
  response: string;
  error: string;
};

export async function getChatbotResponseAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      response: '',
      error: 'Invalid input. Please enter a message.',
    };
  }

  try {
    const result = await getTechjaguarChatResponse({
      message: validatedFields.data.message,
    });
    return {
      response: result.response,
      error: '',
    };
  } catch (error) {
    console.error(error);
    return {
      response: '',
      error: 'Failed to get a response from the assistant.',
    };
  }
}
