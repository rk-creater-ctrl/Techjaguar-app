
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const schema = z.object({
  uid: z.string().min(1, 'UID is required.'),
});

export type FormState = {
  message: string;
};

export async function setInstructorAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    uid: formData.get('uid'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error: Invalid UID provided.',
    };
  }

  const { uid } = validatedFields.data;
  const envVar = `NEXT_PUBLIC_INSTRUCTOR_UID=${uid}`;

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, we will create it.
    }

    const lines = envContent.split('\n');
    let found = false;
    const newLines = lines.map(line => {
      if (line.startsWith('NEXT_PUBLIC_INSTRUCTOR_UID=')) {
        found = true;
        return envVar;
      }
      return line;
    });

    if (!found) {
      newLines.push(envVar);
    }

    await fs.writeFile(envPath, newLines.join('\n'));

    return { message: 'success' };
  } catch (error) {
    console.error('Failed to update .env file:', error);
    return {
      message: 'Error: Could not update the configuration file on the server.',
    };
  }
}
