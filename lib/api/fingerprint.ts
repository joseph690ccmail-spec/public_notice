const FINGERPRINT_KEY = "pnn-draft-fingerprint";
const DRAFT_SESSION_KEY = "pnn-active-draft";

export function getOrCreateDraftFingerprint(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(FINGERPRINT_KEY);
  if (existing) return existing;
  const fingerprint = crypto.randomUUID();
  localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  return fingerprint;
}

export interface StoredDraftSession {
  draftId: string;
  email: string;
  step?: number;
}

export function saveDraftSession(session: StoredDraftSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(session));
}

export function loadDraftSession(): StoredDraftSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraftSession;
    if (parsed.draftId && parsed.email) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearDraftSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_SESSION_KEY);
}