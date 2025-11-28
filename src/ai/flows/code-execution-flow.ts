'use server';

/**
 * @fileOverview An AI-powered code execution flow.
 *
 * - executeCode - A function that takes code and a language and returns the output.
 * - ExecuteCodeInput - The input type for the executeCode function.
 * - ExecuteCodeOutput - The return type for the executeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExecuteCodeInputSchema = z.object({
  language: z
    .string()
    .describe(
      'The programming language of the code snippet (e.g., "python", "java", "c++").'
    ),
  code: z.string().describe('The code snippet to execute.'),
});
export type ExecuteCodeInput = z.infer<typeof ExecuteCodeInputSchema>;

const ExecuteCodeOutputSchema = z.object({
  output: z
    .string()
    .describe('The captured stdout or stderr from the code execution.'),
});
export type ExecuteCodeOutput = z.infer<typeof ExecuteCodeOutputSchema>;

export async function executeCode(
  input: ExecuteCodeInput
): Promise<ExecuteCodeOutput> {
  return codeExecutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeExecutionPrompt',
  input: {schema: ExecuteCodeInputSchema},
  output: {schema: ExecuteCodeOutputSchema},
  prompt: `You are a universal code compiler and runtime environment. You will be given a code snippet and its programming language. Your task is to execute the code and return only the exact output that would be printed to the standard output (stdout).

Do not provide any explanation, commentary, or formatting. Only return the raw output of the code. If the code produces an error, return the error message that would be printed to standard error (stderr).

Language: {{{language}}}
Code:
\'\'\'
{{{code}}}
\'\'\'
`,
});

const codeExecutionFlow = ai.defineFlow(
  {
    name: 'codeExecutionFlow',
    inputSchema: ExecuteCodeInputSchema,
    outputSchema: ExecuteCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
