"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getAuthToken } from "../lib/cookie";
import { handleLogout } from "../lib/actions/auth-action";
import api from "../lib/api/axios";

export interface UserProfile {
    id: string;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    profileImage: string | null;
    role: string;
    mfaEnabled?: boolean;
    createdAt: string;
}

interface AuthContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    loading: boolean;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;

    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/api/auth/profile");
            if (res.data.success) {
                setUser(res.data.data);
                setIsAuthenticated(true);
            }
        } catch {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const checkAuth = async () => {
        try {
            const token = await getAuthToken();
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
                return;
            }
            setIsAuthenticated(true);
            await fetchProfile();
        } catch {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        setIsAuthenticated(false);
        setUser(null);
        await handleLogout();
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            user,
            setUser,
            loading,
            logout,
            checkAuth,
            refetchProfile: fetchProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};