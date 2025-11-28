'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Shield, Users } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { User as UserSchema } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function UserRow({ user }: { user: WithId<UserSchema> }) {
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.charAt(0);
    };

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.name}</div>
                </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
        </TableRow>
    );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isInstructor) return null;
    return collection(firestore, 'users');
  }, [firestore, isInstructor]);
  
  const { data: users, isLoading } = useCollection<UserSchema>(usersQuery);

  useEffect(() => {
    if (!isUserLoading && !isInstructor) {
      router.replace('/');
    }
  }, [isUserLoading, isInstructor, router]);

  if (isUserLoading || !isInstructor) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Shield className="h-8 w-8 text-accent" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage users and other application settings.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Users className="h-5 w-5" /> Registered Users
          </CardTitle>
          <CardDescription>
            A list of all users who have signed up for the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users && users.length > 0 ? (
                 users.map((user) => <UserRow key={user.id} user={user} />)
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
