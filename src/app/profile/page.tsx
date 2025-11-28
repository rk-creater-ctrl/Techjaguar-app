'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/firebase/non-blocking-login';
import { Pencil, AlertTriangle, Copy } from 'lucide-react';
import React, { useRef, useEffect, useActionState } from 'react';
import Link from 'next/link';
import { setInstructorAction, type FormState } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


function AdminSetupCard({ uid }: { uid: string }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(setInstructorAction, { message: '' });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  // A "set" instructor UID is one that is not the placeholder value.
  const hasInstructorBeenSet = process.env.NEXT_PUBLIC_INSTRUCTOR_UID && process.env.NEXT_PUBLIC_INSTRUCTOR_UID !== 'YOUR_INSTRUCTOR_FIREBASE_UID';

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: "Instructor Set!",
        description: "You are now the instructor. The page will reload to apply changes.",
      });
      // A full page reload is needed for the client to read the new .env variable
      setTimeout(() => window.location.reload(), 2000);
    } else if (state.message && state.message.startsWith('Error:')) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: state.message,
      });
    }
  }, [state, toast]);
  
  if (hasInstructorBeenSet) {
    return null;
  }
  
  const copyUidToClipboard = () => {
    navigator.clipboard.writeText(uid);
    toast({
      title: "UID Copied!",
      description: "Your User ID has been copied to the clipboard.",
    });
  };

  return (
     <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <CardTitle className="font-headline text-destructive">Admin Setup Required</CardTitle>
            <CardDescription>
              To complete the app setup, make your account the official instructor.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
        <form
          ref={formRef}
          action={formAction}
        >
      <CardContent>
        <p className="mb-4">Your User ID (UID) is used to identify you as the instructor.</p>
        <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
            <input type="hidden" name="uid" value={uid} />
            <code className="text-sm font-semibold flex-grow">{uid}</code>
            <Button type="button" variant="ghost" size="icon" onClick={copyUidToClipboard} aria-label="Copy UID">
                <Copy className="h-4 w-4" />
            </Button>
        </div>
         <p className="mt-4 text-muted-foreground text-sm">
          Click the button below to set this user account as the instructor for this application. This action can only be done once.
        </p>
      </CardContent>
      <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Assigning...' : 'Make Me the Instructor'}
          </Button>
      </CardFooter>
      </form>
    </Card>
  );
}


function ProfileEditForm() {
    const { user } = useUser();
    const auth = useAuth();
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            displayName: user?.displayName || '',
        },
    });

    function onSubmit(data: ProfileFormValues) {
        updateUserProfile(auth, {
            displayName: data.displayName,
        });
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved.",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Edit Profile</CardTitle>
                <CardDescription>Update your display name.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a service like Firebase Storage
      // and get the URL back. Here, we'll simulate this by using a placeholder.
      const placeholderUrl = 'https://i.pravatar.cc/150?u=' + user?.uid + Date.now();
      
      updateUserProfile(auth, { photoURL: placeholderUrl });
      
      toast({
        title: "Profile Picture Updating",
        description: "Your new profile picture is being saved.",
      });
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </CardHeader>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <AdminSetupCard uid={user.uid} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
             <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback className="text-3xl">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={handleAvatarClick}
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-8 w-8 text-white" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
            </div>
            <div>
              <CardTitle className="text-3xl font-headline">{user.displayName}</CardTitle>
              <CardDescription className="text-lg">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <ProfileEditForm />

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Subscription</CardTitle>
          <CardDescription>Manage your billing and subscription details.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">View your current plan and payment history.</p>
        </CardContent>
        <CardFooter className="border-t pt-6">
            <Link href="/billing">
                <Button>Manage Subscription</Button>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

    