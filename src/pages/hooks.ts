import { useParams } from "react-router";

export function usePageParams<T>(): T {
  return useParams() as unknown as T;
}
