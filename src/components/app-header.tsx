import Link from 'next/link';
import {
  Home,
  BookOpen,
  Sparkles,
  Radio,
  Search,
  PanelLeft,
  Video,
  Mic,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import { TechJaguarLogo } from '@/components/icons';
import { useUser } from '@/firebase';

export function AppHeader() {
  const { user } = useUser();
  // In a real app, this would be a custom claim or role from your database.
  const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-card">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <TechJaguarLogo className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">TechJaguar</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="h-5 w-5" />
              Courses
            </Link>
             <Link
              href="/classes"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Video className="h-5 w-5" />
              Classes
            </Link>
            <Link
              href="/live-sessions"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Radio className="h-5 w-5" />
              Live Sessions
            </Link>
            <Link
              href="/recommendations"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="h-5 w-5" />
              For You
            </Link>
            {isInstructor && (
              <Link
                href="/studio"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Mic className="h-5 w-5" />
                Studio
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <UserNav />
    </header>
  );
}
