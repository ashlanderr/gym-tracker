import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  Query,
  DocumentReference,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyDh-1aOWA8DU2uacjCxJsMCI3p2v-1kJFg",
  authDomain: "gym-tracker-e77e5.firebaseapp.com",
  projectId: "gym-tracker-e77e5",
  storageBucket: "gym-tracker-e77e5.firebasestorage.app",
  messagingSenderId: "778763865283",
  appId: "1:778763865283:web:165931321e0b1e6e846676",
};

const app = initializeApp(firebaseConfig);

export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    tabManager: persistentMultipleTabManager(),
  }),
});

export type QueryOptions = {
  query: () => Query;
  enabled?: boolean;
  deps: readonly unknown[];
};

export type DocumentOptions = {
  query: () => DocumentReference;
  enabled?: boolean;
  deps: readonly unknown[];
};

export async function firestoreQuery<T>(query: Query): Promise<T[]> {
  const result = await getDocs(query);
  return result.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
}

export function useFirestoreQuery<T>({
  query,
  enabled,
  deps,
}: QueryOptions): T[] {
  const [state, setState] = useState<T[]>([]);

  useEffect(() => {
    if (enabled === false) {
      setState([]);
      return;
    }

    const q = query();

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setState(docs as T[]);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function useFirestoreDocument<T>({
  query,
  enabled,
  deps,
}: DocumentOptions): T | undefined {
  const [state, setState] = useState<T | undefined>(undefined);

  useEffect(() => {
    if (enabled === false) {
      setState(undefined);
      return;
    }

    const q = query();

    const unsub = onSnapshot(q, (snapshot) => {
      const doc = snapshot.data();
      setState({ ...doc, id: snapshot.id } as T);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateFirestoreId(): string {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => CHARS[byte % CHARS.length]).join("");
}
