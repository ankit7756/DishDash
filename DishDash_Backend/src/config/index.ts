import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "dishdash_secret_key";

export const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dishdash";

export const PORT = Number(process.env.PORT) || 5050;

export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Add to existing exports
export const EMAIL_USER = process.env.EMAIL_USER || "";
export const EMAIL_PASS = process.env.EMAIL_PASS || "";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// SECURITY FEATURE: CAPTCHA (reCAPTCHA v2). Falls back to Google's official
// public test secret key, which always validates successfully — safe for local
// dev without a real Google account, but MUST be replaced with a real secret
// key (from a free Google reCAPTCHA registration) before any real deployment.
export const RECAPTCHA_SECRET_KEY =
    process.env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

// SECURITY FEATURE: field-level encryption key (AES-256-CBC) for sensitive
// data at rest. The fallback below is fine for local dev only — a real
// deployment MUST set a long, random ENCRYPTION_KEY in its environment and
// keep it out of version control, since anyone with this key can decrypt
// stored phone numbers/addresses.
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "dev-only-encryption-key-change-me";

// SECURITY / TRANSACTION FEATURE: Khalti ePayment integration (real trusted
// third-party payment gateway — Stripe/PayPal both restrict account creation
// from Nepal, so Khalti is the regionally appropriate equivalent, and matches
// the "Khalti" payment method already used in this app's design). Sandbox
// base URL per Khalti's official docs; the secret key MUST be the test key
// from test-admin.khalti.com, never a real production key, for this project.
export const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "";
export const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";