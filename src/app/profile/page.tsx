
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/firebase/non-blocking-login';
import { Clipboard, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import React, { useRef, useActionState } from 'react';
import { setInstructorAction } from './actions';

interface Subscription {
  id: string;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: { toDate: () => Date };
  endDate: { toDate: () => Date };
}

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


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


function SubscriptionDetails({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users', userId, 'subscriptions'));
  }, [firestore, userId]);
  
  const { data: subscriptions, isLoading, error } = useCollection<Subscription>(subscriptionsQuery);

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (error) {
    return <p className="text-destructive">Error loading subscription.</p>;
  }

  const subscription = subscriptions?.[0];

  if (!subscription) {
    return (
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No active subscription found.</p>
            <Button>Upgrade to Pro</Button>
        </div>
      </CardContent>
    );
  }

  const getBadgeVariant = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <CardContent className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Status</p>
        <Badge variant={getBadgeVariant(subscription.status)} className="capitalize">{subscription.status}</Badge>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <p className="font-semibold">Start Date</p>
        <p>{subscription.startDate.toDate().toLocaleDateString()}</p>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <p className="font-semibold">End Date</p>
        <p>{subscription.endDate.toDate().toLocaleDateString()}</p>
      </div>
    </CardContent>
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

    </div>
  );
}
