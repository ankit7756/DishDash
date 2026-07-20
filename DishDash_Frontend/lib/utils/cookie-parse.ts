// Plain utility — NOT a "use server" file, since it's a synchronous helper.
// Next.js requires every export from a "use server" file to be async, so
// this lives separately and gets imported by both session.ts and auth.ts.
export const extractCookieValue = (setCookieHeaders: string[] | undefined, name: string): string | null => {
    if (!setCookieHeaders) return null;
    for (const header of setCookieHeaders) {
        const match = header.match(new RegExp(`${name}=([^;]+)`));
        if (match) return match[1];
    }
    return null;
};