import {
  getAuth,
  signInWithPopup,
  signOut as signOutInner,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously as signInAnonymouslyInner,
} from "firebase/auth";
import { firebaseApp } from "./app.ts";
import { useEffect, useState } from "react";

export const firebaseAuth = getAuth(firebaseApp);

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);
  return result.user;
}

export async function signInAnonymously() {
  const result = await signInAnonymouslyInner(firebaseAuth);
  return result.user;
}

export async function signOut() {
  await signOutInner(firebaseAuth);
}

export function useAuth() {
  const [user, setUser] = useState(() => firebaseAuth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { user, loading };
}

export function useUser() {
  const { user } = useAuth();
  if (!user) throw new Error("User is not authenticated");
  return user;
}
