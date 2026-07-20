"use server"

import { cookies } from "next/headers"

interface UserData {
    _id: string;
    email: string;
    fullName: string;
    username: string;
    phone: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
};

// Access token: short-lived (15 min on the backend) — cookie maxAge matches
// that intent so a stale cookie doesn't outlive its own token's validity.
export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, { ...COOKIE_OPTIONS, maxAge: 60 * 15 });
}

export const getAuthToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
}

// Refresh token: re-issued as a Next.js-owned httpOnly cookie after being
// relayed from the backend's own Set-Cookie (see lib/api/auth.ts). Same
// security properties (httpOnly, never touched by client JS) — just hosted
// under the frontend's own domain instead of proxying the raw cross-origin
// cookie, which keeps SameSite=Lax working simply without cross-site cookie
// complications.
export const setRefreshToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set('refresh_token', token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 });
}

export const getRefreshToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get('refresh_token')?.value || null;
}

export const setUserData = async (userData: UserData) => {
    const cookieStore = await cookies();
    cookieStore.set('user_data', JSON.stringify(userData), { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 });
}

export const getUserData = async (): Promise<UserData | null> => {
    const cookieStore = await cookies();
    const userData = cookieStore.get('user_data')?.value || null;
    return userData ? JSON.parse(userData) : null;
}

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();

    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('user_data');

    cookieStore.delete('token');
    cookieStore.delete('user');
}