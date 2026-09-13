const ACCOUNT_ID_STORAGE_KEY = "ACCOUNT_ID";

export function getAccountId(): string {
  const stored = localStorage.getItem(ACCOUNT_ID_STORAGE_KEY);
  if (stored) return stored;

  const id = crypto.randomUUID();
  localStorage.setItem(ACCOUNT_ID_STORAGE_KEY, id);
  return id;
}

export function setAccountId(id: string) {
  localStorage.setItem(ACCOUNT_ID_STORAGE_KEY, id);
}

export function useAccountId(): string {
  return getAccountId();
}
