'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getChatbotResponseAction, type FormState } from './actions';
import { useUser } from '@/firebase';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const initialState: FormState = {
  response: '',
  error: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Send />}
    </Button>
  );
}

export default function ChatbotPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I'm the Techjaguar Academy assistant. How can I help you today?",
    },
  ]);
  const [state, formAction] = useFormState(getChatbotResponseAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.response) {
      setMessages((prev) => [...prev, { sender: 'bot', text: state.response }]);
    }
    if (state.error) {
       setMessages((prev) => [...prev, { sender: 'bot', text: `Sorry, something went wrong: ${state.error}` }]);
    }
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to bottom.
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages])

  const handleFormSubmit = (formData: FormData) => {
    const userInput = formData.get('message') as string;
    if (userInput.trim()) {
      setMessages((prev) => [...prev, { sender: 'user', text: userInput }]);
      formAction(formData);
      formRef.current?.reset();
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
       <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-accent" />
            Academy Assistant
          </h1>
          <p className="text-muted-foreground">
            Your personal guide to Techjaguar Academy Rewa.
          </p>
        </div>
      </div>
      <Card className="h-[70vh] flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Bot /> Chat with Us
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  ) : null}
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                   {message.sender === 'user' && user ? (
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  ) : null}
                </div>
              ))}
            </div>
          </ScrollArea>
          <form
            ref={formRef}
            action={handleFormSubmit}
            className="flex items-center gap-2 border-t pt-4"
          >
            <Input
              name="message"
              placeholder="Ask about courses, location, or anything else..."
              autoComplete="off"
            />
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
