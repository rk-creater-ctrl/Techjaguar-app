
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

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
  
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = '';
  try {
    envContent = await fs.readFile(envPath, 'utf8');
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      // If the file doesn't exist, we'll create it. 
      // If another error occurs, we should throw it.
      return { message: `Error reading configuration file: ${error.message}` };
    }
  }

  // Check if the instructor UID is already set to a non-placeholder value.
  const existingUidLine = envContent.split('\n').find(line => line.startsWith('NEXT_PUBLIC_INSTRUCTOR_UID='));
  if (existingUidLine) {
     const existingUid = existingUidLine.split('=')[1];
     if(existingUid && existingUid.trim() !== '' && existingUid.trim() !== 'YOUR_INSTRUCTOR_FIREBASE_UID') {
        return { message: 'Error: An instructor has already been set for this application.' };
     }
  }

  const { uid } = validatedFields.data;
  const envVar = `NEXT_PUBLIC_INSTRUCTOR_UID=${uid}`;

  try {
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
    
    // Ensure no blank lines at the end of the file
    const finalContent = newLines.filter(line => line.trim() !== '').join('\n');

    await fs.writeFile(envPath, finalContent);
    
    // Revalidate all paths to ensure the new env var is picked up by server components
    revalidatePath('/', 'layout');

    return { message: 'success' };
  } catch (error: any) {
    console.error('Failed to update .env file:', error);
    return {
      message: `Error: Could not update the configuration file on the server. ${error.message}`,
    };
  }
}

    