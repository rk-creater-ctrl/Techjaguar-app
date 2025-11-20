
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Bot, User, Send, Loader2, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { z } from 'zod';
import { getTechjaguarChatResponse } from '@/ai/flows/techjaguar-chat-flow';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const schema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

export type FormState = {
  response: string;
  error: string;
};

const initialState: FormState = {
  response: '',
  error: '',
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Send />}
    </Button>
  );
}

export function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I'm the Techjaguar Academy assistant. How can I help?",
    },
  ]);
  const [state, formAction] = useActionState(
    getChatbotResponseAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.response) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: state.response },
      ]);
    }
    if (state.error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `Sorry, something went wrong: ${state.error}` },
      ]);
    }
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleFormSubmit = (formData: FormData) => {
    const userInput = formData.get('message') as string;
    if (userInput.trim()) {
      setMessages((prev) => [...prev, { sender: 'user', text: userInput }]);
      formAction(formData);
      formRef.current?.reset();
    }
  };

  // Don't render the widget on login/signup pages
  if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/signup')) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Bot className="h-7 w-7" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 h-[28rem] p-0 flex flex-col mr-4 mb-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-headline flex items-center gap-2">
            <Bot /> TechJaguar Assistant
          </h3>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 text-sm ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <form
          ref={formRef}
          action={handleFormSubmit}
          className="flex items-center gap-2 border-t p-3"
        >
          <Input name="message" placeholder="Ask a question..." autoComplete="off" />
          <SubmitButton />
        </form>
      </PopoverContent>
    </Popover>
  );
}
