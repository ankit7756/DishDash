"use server";

import {
    login, register, whoAmI, updateProfile, resetPassword, requestPasswordReset,
    setupMfa, confirmMfa, verifyMfaLogin, disableMfa,
    changePassword, completePasswordChange, logoutApi, exportUserData,
} from "../api/auth";
import { LoginData, RegisterData } from "../../app/(auth)/schema";
import { setAuthToken, setUserData, setRefreshToken, clearAuthCookies } from "../cookie";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const handleRegister = async (data: RegisterData & { captchaToken?: string }) => {
    try {
        const response = await register(data);
        if (response.success) {
            return { success: true, message: 'Registration successful', data: response.user };
        }
        return { success: false, message: response.message || 'Registration failed' };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Registration action failed' };
    }
};

// Three possible outcomes now, not just success/fail:
// 1. mfaRequired — password was correct, but a TOTP code is still needed
// 2. passwordChangeRequired — password expired (90-day policy), must be changed first
// 3. a real, full login success
export const handleLogin = async (data: LoginData & { captchaToken?: string }) => {
    try {
        const response = await login(data);

        if (response.mfaRequired) {
            return { success: true, mfaRequired: true, mfaPendingToken: response.mfaPendingToken };
        }

        if (response.passwordChangeRequired) {
            return { success: true, passwordChangeRequired: true, passwordChangePendingToken: response.passwordChangePendingToken };
        }

        if (response.success && response.token && response.user) {
            await setAuthToken(response.token);
            await setUserData(response.user);
            if (response._refreshToken) {
                await setRefreshToken(response._refreshToken);
            }
            return { success: true, message: 'Login successful', data: response.user };
        }

        return { success: false, message: response.message || 'Login failed' };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Login action failed' };
    }
};

export const handleVerifyMfa = async (mfaPendingToken: string, token: string) => {
    try {
        const response = await verifyMfaLogin(mfaPendingToken, token);
        if (response.success && response.token && response.user) {
            await setAuthToken(response.token);
            await setUserData(response.user);
            if (response._refreshToken) {
                await setRefreshToken(response._refreshToken);
            }
            return { success: true, message: 'Login successful', data: response.user };
        }
        return { success: false, message: response.message || 'MFA verification failed' };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'MFA verification failed' };
    }
};

export const handleCompletePasswordChange = async (passwordChangePendingToken: string, newPassword: string) => {
    try {
        const response = await completePasswordChange(passwordChangePendingToken, newPassword);
        if (response.success && response.token && response.user) {
            await setAuthToken(response.token);
            await setUserData(response.user);
            if (response._refreshToken) {
                await setRefreshToken(response._refreshToken);
            }
            return { success: true, message: 'Password updated. Login successful.', data: response.user };
        }
        return { success: false, message: response.message || 'Password update failed' };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Password update failed' };
    }
};

export const handleLogout = async () => {
    await logoutApi();
    await clearAuthCookies();
    redirect('/login');
};

export async function handleWhoAmI() {
    try {
        const result = await whoAmI();
        if (result.success) {
            return { success: true, message: 'User data fetched successfully', data: result.data };
        }
        return { success: false, message: result.message || 'Failed to fetch user data' };
    } catch (error: Error | any) {
        return { success: false, message: error.message };
    }
}

export async function handleUpdateProfile(profileData: FormData) {
    try {
        const result = await updateProfile(profileData);
        if (result.success) {
            await setUserData(result.data);
            revalidatePath('/user/profile');
            return { success: true, message: 'Profile updated successfully', data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update profile' };
    } catch (error: Error | any) {
        return { success: false, message: error.message };
    }
}

export const handleRequestPasswordReset = async (email: string, captchaToken?: string) => {
    try {
        const response = await requestPasswordReset(email, captchaToken);
        if (response.success) {
            return { success: true, message: 'If the email is registered, a reset link has been sent.' };
        }
        return { success: false, message: response.message || 'Request password reset failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Request password reset action failed' };
    }
};

export const handleResetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await resetPassword(token, newPassword);
        if (response.success) {
            return { success: true, message: 'Password has been reset successfully' };
        }
        return { success: false, message: response.message || 'Reset password failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Reset password action failed' };
    }
};

export const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
        const response = await changePassword(oldPassword, newPassword);
        return response.success
            ? { success: true, message: 'Password changed successfully' }
            : { success: false, message: response.message || 'Password change failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Password change failed' };
    }
};

export const handleSetupMfa = async () => {
    try {
        const response = await setupMfa();
        return response.success
            ? { success: true, qrCodeDataUrl: response.qrCodeDataUrl, secret: response.secret }
            : { success: false, message: response.message || 'MFA setup failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'MFA setup failed' };
    }
};

export const handleConfirmMfa = async (token: string) => {
    try {
        const response = await confirmMfa(token);
        return response.success
            ? { success: true, message: 'MFA enabled successfully' }
            : { success: false, message: response.message || 'Invalid verification code' };
    } catch (error: any) {
        return { success: false, message: error.message || 'MFA confirmation failed' };
    }
};

export const handleDisableMfa = async (password: string) => {
    try {
        const response = await disableMfa(password);
        return response.success
            ? { success: true, message: 'MFA disabled' }
            : { success: false, message: response.message || 'Disabling MFA failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Disabling MFA failed' };
    }
};

export const handleExportData = async () => {
    try {
        const response = await exportUserData();
        return response.success
            ? { success: true, data: response }
            : { success: false, message: response.message || 'Data export failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Data export failed' };
    }
};