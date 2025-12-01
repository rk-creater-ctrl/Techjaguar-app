'use client';
import Link from 'next/link';
import { Home, BookOpen, Sparkles, Radio, Star, Video, Mic, Code, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { TechJaguarLogo } from './icons';
import { NavLink } from './nav-link';
import { useUser } from '@/firebase';

export function AppSidebar() {
  const { user } = useUser();
  const isInstructor = user?.email === 'codenexus199@gmail.com';

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
            <TechJaguarLogo className="h-6 w-6 text-primary" />
            <span className="">TechJaguar</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink href="/">
              <Home className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink href="/courses">
              <BookOpen className="h-4 w-4" />
              Courses
            </NavLink>
             <NavLink href="/classes">
              <Video className="h-4 w-4" />
              Classes
            </NavLink>
             <NavLink href="/live-sessions">
              <Radio className="h-4 w-4" />
              Live Sessions
            </NavLink>
            <NavLink href="/playground">
              <Code className="h-4 w-4" />
              Code Editor
            </NavLink>
            <NavLink href="/recommendations">
              <Sparkles className="h-4 w-4" />
              For You
            </NavLink>
            {isInstructor && (
              <>
                <NavLink href="/studio">
                  <Mic className="h-4 w-4" />
                  Studio
                </NavLink>
                 <NavLink href="/admin">
                  <Shield className="h-4 w-4" />
                  Admin
                </NavLink>
              </>
            )}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle className="font-headline">Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all courses and features to accelerate your learning.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Link href="/billing">
                <Button size="sm" className="w-full">
                  <Star className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
