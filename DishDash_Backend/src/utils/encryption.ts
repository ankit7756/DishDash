import crypto from "crypto";
import { ENCRYPTION_KEY } from "../config";

// SECURITY FEATURE: field-level encryption (AES-256-CBC) for sensitive data
// at rest (phone numbers, delivery addresses). A random IV is generated per
// encryption and stored alongside the ciphertext (iv:ciphertext, both hex) —
// reusing a static IV would leak whether two encrypted values are identical,
// which a single fixed IV (like a naive AES.encrypt(text, staticKey) approach)
// does not protect against.
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

// Derive a proper 32-byte key from the configured secret via SHA-256, so the
// env var itself doesn't need to be an exact-length raw key.
const getKey = (): Buffer => crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();

export const encrypt = (plainText: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

// Graceful fallback: if the stored value isn't in our "iv:ciphertext" format
// (e.g. legacy plaintext data saved before this feature existed) or fails to
// decrypt, return it as-is rather than throwing — avoids crashing reads of
// pre-existing records during the migration window.
export const decrypt = (value: string): string => {
    try {
        const [ivHex, cipherHex] = value.split(":");
        if (!ivHex || !cipherHex || ivHex.length !== IV_LENGTH * 2) return value;

        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(cipherHex, "hex")), decipher.final()]);
        return decrypted.toString("utf8");
    } catch {
        return value;
    }
};