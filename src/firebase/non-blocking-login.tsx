'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  displayName: string
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      // Once the user is created, update their profile with the display name
      if (userCredential.user) {
        // Do NOT await updateProfile, let it run in the background
        updateProfile(userCredential.user, { displayName });
      }
    })
    .catch((error) => {
      // The onAuthStateChanged listener will handle UI updates on failure
      console.error('Sign up error:', error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}


/** Initiate user profile update (non-blocking). */
export function updateUserProfile(
  authInstance: Auth,
  updates: { displayName?: string; photoURL?: string }
): void {
  if (authInstance.currentUser) {
    updateProfile(authInstance.currentUser, updates).catch((error) => {
      console.error('Profile update error:', error);
    });
  }
}
