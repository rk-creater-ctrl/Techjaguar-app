import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AuthGate } from '@/components/auth-gate';
import { ChatbotWidget } from '@/components/chatbot-widget';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} font-body antialiased`}>
        <FirebaseClientProvider>
          <AuthGate>{children}</AuthGate>
          <ChatbotWidget />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
