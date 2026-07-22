import { NextRequest, NextResponse } from "next/server";

// NOTE: this is a UX convenience layer only, NOT the real security boundary.
// It decodes the JWT payload WITHOUT verifying its signature (Edge runtime
// can't easily do that), purely to redirect optimistically. The actual,
// cryptographically-enforced authorization happens on every single backend
// API call via authMiddleware/adminMiddleware — this middleware just avoids
// rendering a broken/empty page before that 401 comes back.
const decodeRole = (token: string): string | null => {
    try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
        return payload.role || null;
    } catch {
        return null;
    }
};

export function proxy(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;
    const { pathname } = request.nextUrl;

    const isAuthPage = ["/login", "/register", "/forgot-password"].includes(pathname);

    if (!token && (pathname.startsWith("/user") || pathname.startsWith("/admin"))) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && pathname.startsWith("/admin")) {
        const role = decodeRole(token);
        if (role !== "admin") {
            return NextResponse.redirect(new URL("/user/dashboard", request.url));
        }
    }

    if (token && isAuthPage) {
        const role = decodeRole(token);
        return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/user/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/user/:path*", "/admin/:path*", "/login", "/register", "/forgot-password"],
};