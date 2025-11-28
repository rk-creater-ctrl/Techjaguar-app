'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { createSubscription } from '@/lib/actions';

const checkoutSchema = z.object({
  cardName: z.string().min(2, 'Name on card is required.'),
  cardNumber: z
    .string()
    .length(16, 'Card number must be 16 digits.')
    .regex(/^\d+$/, 'Card number must only contain digits.'),
  expiryDate: z
    .string()
    .length(5, 'Expiry date must be in MM/YY format.')
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Invalid expiry date format.'),
  cvc: z.string().length(3, 'CVC must be 3 digits.'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to subscribe.',
      });
      return;
    }

    toast({
      title: 'Processing Payment...',
      description: 'Please wait while we process your subscription.',
    });

    // In a real app, this is where you would call your payment provider (Stripe, etc.)
    // For now, we simulate a delay and then create the subscription directly.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await createSubscription(firestore, user.uid);
      // The server action will redirect on success
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description:
          error.message || 'Could not create your subscription. Please try again.',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            Upgrade to TechJaguar Pro
          </CardTitle>
          <CardDescription>
            Enter your payment information to unlock all premium content.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="cardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name on Card</FormLabel>
                    <FormControl>
                      <Input placeholder="John M. Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="1234 5678 9012 3456" {...field} />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires</FormLabel>
                      <FormControl>
                        <Input placeholder="MM/YY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cvc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Pay $29.99
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-4 px-8">
        This is a simulated payment form. Do not enter real credit card
        information.
      </p>
    </div>
  );
}
