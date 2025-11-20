
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
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/firebase/non-blocking-login';
import { Pencil, AlertTriangle, Copy } from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { setInstructorAction, FormState } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


function AdminSetupCard({ uid }: { uid: string }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(setInstructorAction, { message: '' });
  const { toast } = useToast();
  const hasInstructorBeenSet = process.env.NEXT_PUBLIC_INSTRUCTOR_UID && process.env.NEXT_PUBLIC_INSTRUCTOR_UID !== 'YOUR_INSTRUCTOR_FIREBASE_UID';

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: "Instructor Set!",
        description: "You are now the instructor. The page will reload to apply changes.",
      });
      // A full page reload is needed to read the new .env variable
      window.location.reload();
    } else if (state.message.startsWith('Error:')) {
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
              To complete the application setup, an instructor must be assigned.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Your User ID (UID) is:</p>
        <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
            <code className="text-sm font-semibold flex-grow">{uid}</code>
            <Button variant="ghost" size="icon" onClick={copyUidToClipboard}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
        <p className="mt-4 text-muted-foreground text-sm">
           To make yourself the instructor, copy this UID and add it to a file named <code className="font-semibold bg-muted px-1 py-0.5 rounded-sm">.env</code> in the root of the project with the following content:
        </p>
         <pre className="mt-2 text-sm p-3 rounded-md bg-muted overflow-x-auto">
          <code>{`NEXT_PUBLIC_INSTRUCTOR_UID=${uid}`}</code>
        </pre>
         <p className="mt-4 text-muted-foreground text-sm">
          After saving the <code className="font-semibold bg-muted px-1 py-0.5 rounded-sm">.env</code> file, you will need to restart the development server for the change to take effect.
        </p>
      </CardContent>
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
