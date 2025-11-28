'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error('Anonymous sign in error:', error);
    toast({
      variant: 'destructive',
      title: 'Sign In Failed',
      description:
        error.message || 'Could not sign in anonymously. Please try again.',
    });
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  displayName: string,
  onFinally?: () => void
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      if (userCredential.user) {
        updateProfile(userCredential.user, { displayName });
      }
    })
    .catch((error) => {
      console.error('Sign up error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description:
          error.message || 'Could not create your account. Please try again.',
      });
    })
    .finally(() => {
        onFinally?.();
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string,
  onFinally?: () => void
): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
      console.error('Sign in error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description:
          error.message || 'Invalid email or password. Please try again.',
      });
    })
    .finally(() => {
        onFinally?.();
    });
}

/** Initiate user profile update (non-blocking). */
export function updateUserProfile(
  authInstance: Auth,
  updates: { displayName?: string; photoURL?: string }
): void {
  if (authInstance.currentUser) {
    updateProfile(authInstance.currentUser, updates).catch((error) => {
      console.error('Profile update error:', error);
      toast({
        variant: 'destructive',
        title: 'Profile Update Failed',
        description: error.message || 'Could not update your profile.',
      });
    });
  }
}
