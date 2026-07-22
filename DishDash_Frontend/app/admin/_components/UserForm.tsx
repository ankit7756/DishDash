"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, X, Loader2, Check, User, AtSign, Mail, Phone, Lock, Shield } from "lucide-react";

interface UserFormProps {
    initialData?: any;
    onSubmit: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
    mode: "add" | "edit";
}

const inputCls = "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white/90 focus:outline-none focus:ring-1 focus:ring-amber-400/60 focus:border-amber-400/40 placeholder:text-white/20 transition-all";

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-amber-400/60" />
                {label}
            </label>
            {children}
        </div>
    );
}

export default function UserForm({ initialData, onSubmit, mode }: UserFormProps) {
    const [fullName, setFullName] = useState(initialData?.fullName ?? "");
    const [username, setUsername] = useState(initialData?.username ?? "");
    const [email, setEmail] = useState(initialData?.email ?? "");
    const [phone, setPhone] = useState(initialData?.phone ?? "");
    const [role, setRole] = useState(initialData?.role ?? "user");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === "add" && !password) { setError("Password is required"); return; }
        if (password && password !== confirmPassword) { setError("Passwords do not match"); return; }
        if (password && password.length < 6) { setError("Password must be at least 6 characters"); return; }

        const fd = new FormData();
        if (fullName) fd.append("fullName", fullName);
        if (username) fd.append("username", username);
        if (email) fd.append("email", email);
        if (phone) fd.append("phone", phone);
        fd.append("role", role);
        if (password) fd.append("password", password);
        if (file) fd.append("profileImage", file);

        setLoading(true);
        try {
            const res = await onSubmit(fd);
            if (res.success) {
                setSuccess(true);
            } else {
                setError(res.message ?? "Something went wrong");
            }
        } catch (err: any) {
            setError(err.message ?? "Failed");
        } finally {
            setLoading(false);
        }
    };

    const currentImage = preview ?? initialData?.profileImage ?? null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">

            {/* Photo upload */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 flex flex-col items-center gap-4">
                <div className="relative group">
                    <div className="h-20 w-20 rounded-full overflow-hidden ring-1 ring-white/10">
                        {currentImage ? (
                            <Image src={currentImage} alt="Preview" width={80} height={80} unoptimized className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0a0c12] text-xl font-black">
                                {fullName?.[0]?.toUpperCase() ?? "U"}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-amber-400 text-[#0a0c12] flex items-center justify-center shadow-lg hover:bg-amber-300 transition-colors border-2 border-[#0a0c12]"
                    >
                        <Camera className="h-3.5 w-3.5" />
                    </button>
                    {preview && (
                        <button
                            type="button"
                            onClick={() => { setPreview(null); setFile(null); }}
                            className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500/90 text-white flex items-center justify-center border-2 border-[#0a0c12]"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-[12px] font-semibold text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                    {preview ? "Change photo" : "Upload photo"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>

            {/* User details */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-5">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">User Details</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" icon={User}>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                            placeholder="Full name" className={inputCls} required />
                    </Field>
                    <Field label="Username" icon={AtSign}>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                            placeholder="username" className={inputCls} required />
                    </Field>
                    <Field label="Email" icon={Mail}>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com" className={inputCls} required />
                    </Field>
                    <Field label="Phone" icon={Phone}>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                            placeholder="98XXXXXXXX" className={inputCls} required />
                    </Field>
                    <Field label="Role" icon={Shield}>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </Field>
                </div>

                {/* Password section */}
                <div className="border-t border-white/[0.06] pt-5 space-y-4">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        {mode === "edit" ? "Change Password — optional" : "Password"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Password" icon={Lock}>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === "edit" ? "Leave blank to keep" : "Min 6 characters"}
                                className={inputCls} required={mode === "add"} />
                        </Field>
                        <Field label="Confirm Password" icon={Lock}>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password" className={inputCls} required={mode === "add"} />
                        </Field>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-[12px] text-red-400">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || success}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-semibold transition-all disabled:cursor-not-allowed ${success
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-amber-400 text-[#0a0c12] hover:bg-amber-300 disabled:opacity-50"
                        }`}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                        success ? <><Check className="h-4 w-4" /> {mode === "add" ? "User created" : "Changes saved"}</> :
                            mode === "add" ? "Create user" : "Save changes"}
                </button>
            </div>
        </form>
    );
}