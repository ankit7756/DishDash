"use server";

import axios from "axios";
import { getRefreshToken, setAuthToken, setRefreshToken, clearAuthCookies } from "../cookie";
import { extractCookieValue } from "../utils/cookie-parse";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

// Deliberately uses a plain axios call (not the shared interceptor-bearing
// instance from ./axios) to avoid a circular import — axios.ts's response
// interceptor calls this function directly on a 401.
export const refreshSession = async (): Promise<boolean> => {
    try {
        const currentRefreshToken = await getRefreshToken();
        if (!currentRefreshToken) return false;

        const response = await axios.post(
            `${BASE_URL}/api/auth/refresh`,
            {},
            { headers: { Cookie: `refreshToken=${currentRefreshToken}` } }
        );

        const newAccessToken = response.data?.token;
        const newRefreshToken = extractCookieValue(response.headers['set-cookie'], 'refreshToken');

        if (!newAccessToken) return false;

        await setAuthToken(newAccessToken);
        if (newRefreshToken) {
            await setRefreshToken(newRefreshToken);
        }
        return true;
    } catch {
        await clearAuthCookies();
        return false;
    }
};