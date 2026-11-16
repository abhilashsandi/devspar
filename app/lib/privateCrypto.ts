// Decrypts a payload written by scripts/encrypt-private.mjs or scripts/update-my-prep.mjs:
// PBKDF2-SHA256 -> AES-256-GCM (auth tag appended). Runs entirely in the browser; the password is used
// once and never stored. (app/my-prep/PrivateGate.tsx has its own copy of this for the main page.)
export type EncryptedPayload = { iter: number; salt: string; iv: string; ct: string };

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function decryptPayload(payload: EncryptedPayload, password: string): Promise<string> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iter, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, key, b64(payload.ct));
  return new TextDecoder().decode(plain);
}
