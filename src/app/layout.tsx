import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AuthGate } from '@/components/auth-gate';
import { ChatbotWidget } from '@/components/chatbot-widget';

export const metadata: Metadata = {
  title: 'TechJaguar - Your Universe of Learning',
  description: 'Live classes, recorded lectures, notes, and personalized learning paths.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400;1,7..72,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthGate>{children}</AuthGate>
          <ChatbotWidget />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
