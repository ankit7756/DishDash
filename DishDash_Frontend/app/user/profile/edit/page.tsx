"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, User, AtSign, Phone, Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/axios";
import { addNotification } from "@/lib/notifications";

function AvatarPreview({ src, name }: { src?: string | null; name?: string }) {
    const initial = name?.[0]?.toUpperCase() ?? "U";
    if (src) {
        return (
            <Image
                src={src}
                alt={name ?? "Profile"}
                width={96}
                height={96}
                unoptimized
                className="rounded-full object-cover w-full h-full"
            />
        );
    }
    return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
            {initial}
        </div>
    );
}

export default function EditProfilePage() {
    const router = useRouter();
    const { user, refetchProfile } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.fullName ?? "");
            setUsername(user.username ?? "");
            setPhone(user.phone ?? "");
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
        setError(null);
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const removePhoto = () => {
        setFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            if (fullName.trim()) formData.append("fullName", fullName.trim());
            if (username.trim()) formData.append("username", username.trim());
            if (phone.trim()) formData.append("phone", phone.trim());
            if (file) formData.append("profileImage", file);

            await api.put("/api/auth/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Refresh user context so header avatar updates immediately
            await refetchProfile();
            addNotification(
                "Profile Updated 👤",
                "Your profile information has been updated successfully.",
                "profile"
            );

            setSuccess(true);
            setTimeout(() => router.push("/user/profile"), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const displayImage = preview ?? user?.profileImage ?? null;

    return (
        <div className="min-h-screen bg-muted/30 pb-12">

            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 px-4 pt-5 pb-16">
                <div className="mx-auto max-w-lg">
                    <button onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </button>
                    <h1 className="text-2xl font-extrabold text-white">Edit Profile</h1>
                    <p className="text-white/70 text-sm mt-1">Update your personal information</p>
                </div>
            </div>

            <div className="mx-auto max-w-lg px-4 sm:px-6 -mt-10 space-y-4">

                {/* Photo card */}
                <div className="bg-background border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-orange-200 dark:ring-orange-800/50 shadow-md">
                            <AvatarPreview src={displayImage} name={fullName || user?.fullName} />
                        </div>
                        <button type="button" onClick={() => fileRef.current?.click()}
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md transition-colors border-2 border-background">
                            <Camera className="h-4 w-4" />
                        </button>
                        {preview && (
                            <button type="button" onClick={removePhoto}
                                className="absolute top-0 right-0 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow border-2 border-background transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <div className="text-center">
                        <button type="button" onClick={() => fileRef.current?.click()}
                            className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                            {preview ? "Change Photo" : "Upload Photo"}
                        </button>
                        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or WebP · Max 5MB</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-4">
                    <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Personal Info</h2>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-orange-500" />
                            Full Name
                        </label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-muted-foreground" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                            <AtSign className="h-3.5 w-3.5 text-orange-500" />
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                placeholder="yourname"
                                className="w-full rounded-xl border border-border bg-muted/30 pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-muted-foreground" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-orange-500" />
                            Phone Number
                        </label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                            placeholder="98XXXXXXXX"
                            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-muted-foreground" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/70">Email</label>
                        <input type="email" value={user?.email ?? ""} disabled
                            className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" />
                        <p className="text-[11px] text-muted-foreground">Email cannot be changed for security reasons</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading || success}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base shadow-md transition-all duration-200 disabled:cursor-not-allowed ${success
                            ? "bg-green-500 text-white"
                            : "bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white disabled:opacity-70"
                            }`}>
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> :
                            success ? <><Check className="h-5 w-5" /> Saved! Redirecting...</> :
                                "Save Changes"}
                    </button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                    To change your password,{" "}
                    <a href="/forgot-password" className="text-orange-500 font-semibold hover:underline">click here</a>
                </p>
            </div>
        </div>
    );
}