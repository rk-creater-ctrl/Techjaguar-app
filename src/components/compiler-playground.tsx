'use client';

import { useState, useActionState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { executeCodeAction, type FormState } from '@/app/playground/actions';

const languageTemplates = {
  javascript: `console.log("Hello, JavaScript World!");

function add(a, b) {
  return a + b;
}

console.log("2 + 3 =", add(2, 3));`,
  python: `print("Hello, Python World!")

def greet(name):
  return f"Hello, {name}"

print(greet("AI"))`,
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
  mysql: `SELECT 'Hello, MySQL World!' AS message;
  
-- Try another query:
-- SELECT p.productName, p.quantityInStock FROM products p WHERE p.productLine = 'Classic Cars' ORDER BY p.quantityInStock DESC LIMIT 5;`,
};

type Language = keyof typeof languageTemplates;

const languageDisplayNames: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  mysql: 'MySQL',
};

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


export function CompilerPlayground() {
  const [code, setCode] = useState<Record<Language, string>>(languageTemplates);
  const [output, setOutput] = useState('Output will appear here...');
  const [activeTab, setActiveTab] = useState<Language>('javascript');
  
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    executeCodeAction,
    { message: '' }
  );

  const debouncedJsCode = useDebounce(code.javascript, 500);

  const runJsCode = useCallback((jsCode: string) => {
    let capturedOutput = '';
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      capturedOutput += args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return 'Unserializable Object';
          }
        }
        return String(arg);
      }).join(' ') + '\\n';
    };
    
    console.error = (...args) => {
        capturedOutput += `Error: ${args.join(' ')}\n`;
    };

    try {
      new Function(jsCode)();
      setOutput(capturedOutput || 'Code executed successfully, but produced no output.');
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'javascript') {
      runJsCode(debouncedJsCode);
    }
  }, [debouncedJsCode, activeTab, runJsCode]);


  const handleCodeChange = (value: string) => {
    setCode((prev) => ({ ...prev, [activeTab]: value }));
  };
  
  useEffect(() => {
    if (state.message === 'success' && state.data) {
        setOutput(state.data.output);
    } else if (state.message.startsWith('Error:')) {
        setOutput(state.message);
    }
  }, [state]);

  const handleRun = (formData: FormData) => {
     setOutput('Running code...');

    if (activeTab === 'javascript') {
      runJsCode(code.javascript);
    } else {
      formAction(formData);
    }
  };

  return (
    <Tabs
      defaultValue="javascript"
      onValueChange={(value) => {
        const newTab = value as Language;
        setActiveTab(newTab);
        if (newTab !== 'javascript') {
            setOutput('Output will appear here...');
        }
      }}
      className="w-full"
    >
      <form action={handleRun}>
        <input type="hidden" name="language" value={activeTab} />
        <input type="hidden" name="code" value={code[activeTab]} />

        <div className="flex items-center justify-between flex-wrap gap-2">
            <TabsList>
            {Object.keys(languageTemplates).map((lang) => (
                <TabsTrigger key={lang} value={lang}>
                {languageDisplayNames[lang as Language]}
                </TabsTrigger>
            ))}
            </TabsList>
            {activeTab !== 'javascript' && (
                <Button type="submit" disabled={isPending}>
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Play className="mr-2 h-4 w-4" />
                )}
                Run Code
                </Button>
            )}
        </div>
      </form>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {Object.keys(languageTemplates).map((lang) => (
            <TabsContent key={lang} value={lang}>
              <Textarea
                value={code[lang as Language]}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="h-[40vh] font-mono text-sm bg-muted/50"
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
              <pre className="text-sm bg-muted/50 p-4 rounded-md h-[calc(40vh-72px)] overflow-auto whitespace-pre-wrap">
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : output}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </Tabs>
  );
}
