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

const DOCUMENT_OWNER_STORAGE_KEY = "DOCUMENT_OWNER";

// The account the document on the device belongs to, or null while it is
// anonymous. A property of the document rather than of the session: when
// somebody else signs in, this is how the device knows the data is not
// theirs to merge.
export function getDocumentOwner(): string | null {
  return localStorage.getItem(DOCUMENT_OWNER_STORAGE_KEY);
}

export function setDocumentOwner(owner: string | null) {
  if (owner) {
    localStorage.setItem(DOCUMENT_OWNER_STORAGE_KEY, owner);
  } else {
    localStorage.removeItem(DOCUMENT_OWNER_STORAGE_KEY);
  }
}
