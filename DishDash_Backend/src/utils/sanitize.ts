import { filterXSS } from "xss";

// SECURITY FEATURE: NoSQL injection prevention (OWASP Injection). MongoDB
// query operators are plain object keys starting with "$" (e.g. {"$ne": null})
// or containing "." (dot-path traversal). Since Express parses JSON bodies
// into real objects, an attacker can submit {"email": {"$ne": null}} instead
// of a real email string — if that object reaches a Mongoose query unchanged,
// it can bypass intended filters entirely (classic NoSQL auth-bypass pattern).
// This strips any such key recursively before the request reaches a controller.
const stripOperators = (input: any): any => {
    if (Array.isArray(input)) {
        return input.map(stripOperators);
    }
    if (input && typeof input === "object") {
        const clean: Record<string, any> = {};
        for (const key of Object.keys(input)) {
            if (key.startsWith("$") || key.includes(".")) continue; // drop the key entirely
            clean[key] = stripOperators(input[key]);
        }
        return clean;
    }
    return input;
};

// SECURITY FEATURE: stored XSS prevention (OWASP Injection / A03). Rather than
// relying only on the frontend to escape output (React does this by default,
// but that's not a guarantee for every future consumer of this API — mobile
// clients, admin tools, etc.), malicious script content is stripped from
// string fields at write time, so the stored data is safe regardless of how
// it's later rendered.
const sanitizeStrings = (input: any): any => {
    if (Array.isArray(input)) {
        return input.map(sanitizeStrings);
    }
    if (input && typeof input === "object") {
        const clean: Record<string, any> = {};
        for (const key of Object.keys(input)) {
            clean[key] = sanitizeStrings(input[key]);
        }
        return clean;
    }
    if (typeof input === "string") {
        return filterXSS(input, { whiteList: {} }); // strip all HTML/script tags
    }
    return input;
};

export const sanitizeInput = (input: any): any => sanitizeStrings(stripOperators(input));

// Escapes regex metacharacters before a user-controlled string is used inside
// a MongoDB $regex — prevents both regex-based query injection and ReDoS
// (catastrophic backtracking) from a crafted pattern like "(a+)+$".
export const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Guards a req.query value against the bracket-notation injection trick
// (?field[$ne]=x parses to an object, not a string) — only ever returns a
// plain string, or undefined if the value isn't safely string-shaped.
export const toSafeString = (value: unknown): string | undefined =>
    typeof value === "string" ? value : undefined;