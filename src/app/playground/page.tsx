'use client';

import { Code } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CompilerPlayground } from '@/components/compiler-playground';

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Code className="h-8 w-8 text-accent" />
            Code Editor
          </h1>
          <p className="text-muted-foreground">
            Write and test code snippets in various languages.
          </p>
        </div>
      </div>

      <Card className="min-h-[60vh]">
        <CardHeader>
          <CardTitle className="font-headline">Live Compiler</CardTitle>
          <CardDescription>
            Select a language, write your code, and see the output. Code execution is not enabled yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompilerPlayground />
        </CardContent>
      </Card>
    </div>
  );
}
