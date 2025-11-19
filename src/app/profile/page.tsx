
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';

interface Subscription {
  id: string;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: { toDate: () => Date };
  endDate: { toDate: () => Date };
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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  if (isUserLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback className="text-3xl">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-headline">{user.displayName}</CardTitle>
              <CardDescription className="text-lg">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Subscription Details</CardTitle>
          <CardDescription>
            Manage your subscription and billing information.
          </CardDescription>
        </CardHeader>
        <SubscriptionDetails userId={user.uid} />
        <CardFooter className="border-t pt-6">
          <Button variant="outline">Manage Billing</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
