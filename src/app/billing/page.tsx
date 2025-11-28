'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Star } from 'lucide-react';
import type { Subscription } from '@/lib/schema';
import Link from 'next/link';


function SubscriptionDetails() {
  const { user } = useUser();
  const firestore = useFirestore();

  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'subscriptions'));
  }, [firestore, user]);
  
  const { data: subscriptions, isLoading, error } = useCollection<Subscription>(subscriptionsQuery);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
    );
  }

  if (error) {
    return <p className="text-destructive">Error loading subscription details.</p>;
  }

  const subscription = subscriptions?.[0];

  if (!subscription) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">TechJaguar Pro</CardTitle>
          <CardDescription>Unlock all courses and features by upgrading your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
              <Star className="h-12 w-12 text-yellow-500 mb-4" />
              <p className="text-lg font-semibold mb-2">You are on the Free Plan</p>
              <p className="text-muted-foreground mb-6">Upgrade to Pro to access all premium content and live sessions.</p>
              <Link href="/checkout">
                <Button size="lg">Upgrade to Pro</Button>
              </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBadgeVariant = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Subscription</CardTitle>
          <CardDescription>Details about your current TechJaguar Pro plan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
                <p className="font-semibold">Plan</p>
                <p className="font-medium">TechJaguar Pro</p>
            </div>
             <Separator />
            <div className="flex items-center justify-between">
                <p className="font-semibold">Status</p>
                <Badge variant={getBadgeVariant(subscription.status)} className="capitalize">{subscription.status}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
                <p className="font-semibold">Start Date</p>
                <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
                <p className="font-semibold">Renews On</p>
                <p>{new Date(subscription.endDate).toLocaleDateString()}</p>
            </div>
        </CardContent>
    </Card>
  );
}


export default function BillingPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between space-y-2 mb-8">
                <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <CreditCard className="h-8 w-8 text-accent" />
                    Billing
                </h1>
                <p className="text-muted-foreground">
                    Manage your subscription and payment details.
                </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                 <SubscriptionDetails />
            </div>
        </div>
    )
}
