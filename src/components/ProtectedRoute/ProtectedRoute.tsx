import { Navigate } from "react-router";
import { useAuth } from "../../firebase/auth.ts";
import type { ProtectedRouteProps } from "./types.ts";
import { StoreProvider } from "../StoreProvider";

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth/sign-in" replace />;

  return <StoreProvider>{children}</StoreProvider>;
}
