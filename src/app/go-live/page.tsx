import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio } from 'lucide-react';

export default function GoLivePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
            <Radio className="mx-auto h-16 w-16 text-primary" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight font-headline text-foreground sm:text-5xl">
                Go Live Feature Coming Soon!
            </h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
                We're working hard to bring you a seamless live streaming experience.
            </p>
        </div>
    </div>
  );
}
