// TEMPORARY: authentication is bypassed.
//
// The Firebase Google sign-in relies on signInWithPopup, which does not work
// inside the Capacitor WebView. Until it is replaced, the app runs against a
// single hardcoded account so the Android build is usable on a device.
// Everything below is meant to be thrown away together with src/firebase.

export interface User {
  uid: string;
  photoURL: string | null;
  displayName: string | null;
}

const HARDCODED_USER: User = {
  uid: "Ne4CDW5bDDaaRuQOGSNd2ojR6Ut1",
  photoURL: null,
  displayName: null,
};

const AUTH_STATE = { user: HARDCODED_USER, loading: false };

export function useAuth() {
  return AUTH_STATE;
}

export function useUser() {
  return HARDCODED_USER;
}
