'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const languageTemplates = {
  javascript: `console.log("Hello, JavaScript World!");`,
  python: `print("Hello, Python World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java World!");
    }
}`,
  c: `#include <stdio.h>

int main() {
   printf("Hello, C World!\\n");
   return 0;
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, C++ World!" << std::endl;
    return 0;
}`,
  mysql: `SELECT 'Hello, MySQL World!' AS message;`,
};

type Language = keyof typeof languageTemplates;

export function CompilerPlayground() {
  const [code, setCode] = useState<Record<Language, string>>(languageTemplates);
  const [output, setOutput] = useState('Output will appear here...');
  const [activeTab, setActiveTab] = useState<Language>('javascript');

  const handleCodeChange = (value: string) => {
    setCode((prev) => ({ ...prev, [activeTab]: value }));
  };

  const handleRun = () => {
    // In a real app, you would send the code to a backend execution service.
    setOutput(`Running code... (feature not implemented)

Your code:
${code[activeTab]}`);
  };

  return (
    <Tabs
      defaultValue="javascript"
      onValueChange={(value) => setActiveTab(value as Language)}
      className="w-full"
    >
      <div className="flex items-center justify-between flex-wrap">
        <TabsList>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="java">Java</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
          <TabsTrigger value="cpp">C++</TabsTrigger>
          <TabsTrigger value="mysql">MySQL</TabsTrigger>
        </TabsList>
        <Button onClick={handleRun}>
          <Play className="mr-2 h-4 w-4" />
          Run Code
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {Object.keys(languageTemplates).map((lang) => (
            <TabsContent key={lang} value={lang}>
              <Textarea
                value={code[lang as Language]}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="h-[40vh] font-code text-sm bg-muted/50"
                placeholder={`Write your ${lang} code here...`}
              />
            </TabsContent>
          ))}
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted/50 p-4 rounded-md h-[calc(40vh-72px)] overflow-auto">
                {output}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </Tabs>
  );
}
