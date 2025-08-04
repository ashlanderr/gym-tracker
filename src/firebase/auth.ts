import {
  getAuth,
  signInWithPopup,
  signOut as signOutInner,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously as signInAnonymouslyInner,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseApp } from "./app.ts";
import { useEffect, useState } from "react";

export interface User {
  uid: string;
  photoURL: string | null;
  displayName: string | null;
}

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

const LOCAL_STORAGE_KEY = "user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : null;
  });
  const [loading, setLoading] = useState(user === null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        const user = convertUser(firebaseUser);
        setUser(user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      } else {
        setUser(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
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

function convertUser(user: FirebaseUser): User {
  return {
    uid: user.uid,
    photoURL: user.photoURL,
    displayName: user.displayName,
  };
}
