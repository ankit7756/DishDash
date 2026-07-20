import { LoginData, RegisterData } from "../../app/(auth)/schema";
import axios from "./axios"
import { API } from "./endpoints"
import { extractCookieValue } from "../utils/cookie-parse";

export const register = async (registerData: RegisterData & { captchaToken?: string }) => {
    try {
        const response = await axios.post(API.AUTH.REGISTER, registerData)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Registration failed')
    }
}

// Returns the parsed refreshToken alongside the response body, since the
// backend delivers it via Set-Cookie rather than the JSON payload — the
// caller (auth-action.ts) is responsible for storing it via cookie.ts.
export const login = async (loginData: LoginData & { captchaToken?: string }) => {
    try {
        const response = await axios.post(API.AUTH.LOGIN, loginData)
        const refreshToken = extractCookieValue(response.headers['set-cookie'], 'refreshToken');
        return { ...response.data, _refreshToken: refreshToken }
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Login failed')
    }
}

export const whoAmI = async () => {
    try {
        const response = await axios.get(API.AUTH.PROFILE);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch profile');
    }
}

export const updateProfile = async (profileData: FormData) => {
    try {
        const response = await axios.put(API.AUTH.UPDATE_PROFILE, profileData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Update profile failed');
    }
}

export const requestPasswordReset = async (email: string, captchaToken?: string) => {
    try {
        const response = await axios.post(API.AUTH.REQUEST_PASSWORD_RESET, { email, captchaToken });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Request password reset failed');
    }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await axios.post(API.AUTH.RESET_PASSWORD(token), { newPassword });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Reset password failed');
    }
};

// ---------- MFA ----------
export const setupMfa = async () => {
    try {
        const response = await axios.post(API.AUTH.MFA_SETUP);
        return response.data; // { qrCodeDataUrl, secret }
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'MFA setup failed');
    }
};

export const confirmMfa = async (token: string) => {
    try {
        const response = await axios.post(API.AUTH.MFA_CONFIRM, { token });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'MFA confirmation failed');
    }
};

export const verifyMfaLogin = async (mfaPendingToken: string, token: string) => {
    try {
        const response = await axios.post(API.AUTH.MFA_VERIFY, { mfaPendingToken, token });
        const refreshToken = extractCookieValue(response.headers['set-cookie'], 'refreshToken');
        return { ...response.data, _refreshToken: refreshToken };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'MFA verification failed');
    }
};

export const disableMfa = async (password: string) => {
    try {
        const response = await axios.post(API.AUTH.MFA_DISABLE, { password });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Disabling MFA failed');
    }
};

// ---------- Password policy ----------
export const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
        const response = await axios.post(API.AUTH.CHANGE_PASSWORD, { oldPassword, newPassword });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Password change failed');
    }
};

export const completePasswordChange = async (passwordChangePendingToken: string, newPassword: string) => {
    try {
        const response = await axios.post(API.AUTH.COMPLETE_PASSWORD_CHANGE, { passwordChangePendingToken, newPassword });
        const refreshToken = extractCookieValue(response.headers['set-cookie'], 'refreshToken');
        return { ...response.data, _refreshToken: refreshToken };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Password update failed');
    }
};

// ---------- Session ----------
export const logoutApi = async () => {
    try {
        await axios.post(API.AUTH.LOGOUT);
    } catch {
        // Logout should never block the client-side cleanup even if the
        // network call fails — cookies get cleared regardless (see auth-action.ts).
    }
};

// ---------- Privacy ----------
export const exportUserData = async () => {
    try {
        const response = await axios.get(API.AUTH.EXPORT_DATA);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Data export failed');
    }
};