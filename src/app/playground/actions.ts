'use server';

import { z } from 'zod';
import {
  executeCode,
  type ExecuteCodeOutput,
} from '@/ai/flows/code-execution-flow';

const schema = z.object({
  language: z.string(),
  code: z.string(),
});

export type FormState = {
  message: string;
  data?: ExecuteCodeOutput;
};

export async function executeCodeAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    language: formData.get('language'),
    code: formData.get('code'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error: Invalid fields provided.',
    };
  }

  try {
    const result = await executeCode(validatedFields.data);
    return {
      message: 'success',
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Error: Could not get response from AI.',
    };
  }
}
