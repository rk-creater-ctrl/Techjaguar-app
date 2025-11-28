
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';


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
  
  const { firestore } = initializeFirebase();
  const { uid } = validatedFields.data;

  try {
     // Store the instructor UID in a document that security rules can access.
    const configRef = doc(firestore, 'app-config', 'instructor');
    // Ensure the data being set is just { uid: "the-user-id" }
    await setDoc(configRef, { uid });
    
    // Also write to .env for client-side checks
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        return { message: `Error reading configuration file: ${error.message}` };
      }
    }

    const envVar = `NEXT_PUBLIC_INSTRUCTOR_UID=${uid}`;
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
    
    const finalContent = newLines.filter(line => line.trim() !== '').join('\n');
    await fs.writeFile(envPath, finalContent);
    
    revalidatePath('/', 'layout');
    return { message: 'success' };

  } catch (error: any) {
    console.error('Failed to set instructor:', error);
    return {
      message: `Error: Could not update configuration. ${error.message}`,
    };
  }
}
