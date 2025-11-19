import Link from 'next/link';
import { Home, BookOpen, Sparkles, Radio, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { TechLearningsLogo } from './icons';
import { NavLink } from './nav-link';

export function AppSidebar() {
  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
            <TechLearningsLogo className="h-6 w-6 text-primary" />
            <span className="">Tech Learnings</span>
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
            <NavLink href="/recommendations">
              <Sparkles className="h-4 w-4" />
              For You
            </NavLink>
            <NavLink href="/go-live">
              <Radio className="h-4 w-4" />
              Go Live
            </NavLink>
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
              <Button size="sm" className="w-full">
                <Star className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
