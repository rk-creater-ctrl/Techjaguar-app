
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
import { getChatbotResponseAction, type FormState } from '@/app/chatbot/actions';
import Link from 'next/link';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413z" />
  </svg>
);

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
    { response: '', error: ''}
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
  if (
    typeof window !== 'undefined' &&
    (window.location.pathname === '/login' ||
      window.location.pathname === '/signup')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
      <Link
        href="https://wa.me/919630857026"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          className="h-16 w-16 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
          size="icon"
        >
          <WhatsAppIcon className="h-8 w-8" />
        </Button>
      </Link>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className="h-16 w-16 rounded-full shadow-lg animate-pulse"
            size="icon"
          >
            <Bot className="h-8 w-8" />
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
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
            <Input
              name="message"
              placeholder="Ask a question..."
              autoComplete="off"
            />
            <SubmitButton />
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
