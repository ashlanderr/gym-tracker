import {
  getAuth,
  signInWithPopup,
  signOut as signOutInner,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseApp } from "./app.ts";
import { useEffect, useState } from "react";
import { generateId } from "../db";

export interface User {
  uid: string;
  photoURL: string | null;
  displayName: string | null;
}

export const firebaseAuth = getAuth(firebaseApp);

const LOCAL_STORAGE_KEY = "user";
const LOCAL_USER_KEY = "LOCAL_USER";
const localUserListeners = new Set<() => void>();

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);
  return result.user;
}

export function signInLocally(): User {
  const user: User = {
    uid: `local-${generateId()}`,
    photoURL: null,
    displayName: null,
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  localUserListeners.forEach((listener) => listener());
  return user;
}

export async function signOut() {
  if (readLocalUser()) {
    localStorage.removeItem(LOCAL_USER_KEY);
    localUserListeners.forEach((listener) => listener());
    return;
  }
  await signOutInner(firebaseAuth);
}

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : null;
  });
  const [localUser, setLocalUser] = useState(readLocalUser);
  const [firebaseLoading, setFirebaseLoading] = useState(firebaseUser === null);

  useEffect(() => {
    const listener = () => setLocalUser(readLocalUser());
    localUserListeners.add(listener);

    const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        const user = convertUser(firebaseUser);
        setFirebaseUser(user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      } else {
        setFirebaseUser(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      setFirebaseLoading(false);
    });

    return () => {
      localUserListeners.delete(listener);
      unsub();
    };
  }, []);

  return {
    user: localUser ?? firebaseUser,
    loading: localUser === null && firebaseLoading,
  };
}

export function useUser() {
  const { user } = useAuth();
  if (!user) throw new Error("User is not authenticated");
  return user;
}

function readLocalUser(): User | null {
  const localData = localStorage.getItem(LOCAL_USER_KEY);
  return localData ? JSON.parse(localData) : null;
}

function convertUser(user: FirebaseUser): User {
  return {
    uid: user.uid,
    photoURL: user.photoURL,
    displayName: user.displayName,
  };
}
