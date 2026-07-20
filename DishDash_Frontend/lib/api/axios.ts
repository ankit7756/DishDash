import axios from 'axios';
import { getAuthToken } from '../cookie';
import { refreshSession } from './session';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// SECURITY / UX: the access token is intentionally short-lived (15 min) on
// the backend, part of the session-hardening work — stolen-token exposure
// window is small. Rather than making every page handle "token expired"
// manually, a single 401 anywhere transparently attempts one silent refresh
// (via refreshSession(), a Server Action — correctly callable from both
// server and client code, unlike a raw fetch to a relative URL, which only
// resolves in the browser) and retries the original request once. If the
// refresh itself fails (refresh token expired/revoked/reused), the user is
// genuinely logged out — see AuthContext's checkAuth, which re-verifies on
// the next render.
let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/refresh')) {
            originalRequest._retry = true;

            if (isRefreshing) {
                await new Promise<void>((resolve) => pendingQueue.push(resolve));
                return axiosInstance(originalRequest);
            }

            isRefreshing = true;
            try {
                const refreshed = await refreshSession();
                isRefreshing = false;
                pendingQueue.forEach((resolve) => resolve());
                pendingQueue = [];

                if (!refreshed) {
                    return Promise.reject(error);
                }
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                pendingQueue = [];
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;