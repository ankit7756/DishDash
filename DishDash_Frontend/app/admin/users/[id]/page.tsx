"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ChevronLeft, User, Mail, Phone, AtSign, Shield, Calendar,
    Pencil, Trash2, Loader2
} from "lucide-react";
import { getUserById, deleteUser } from "@/lib/api/admin/user";
import DeleteModal from "@/app/_components/DeleteModal";

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-white/[0.05] last:border-0">
            <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                <Icon className="h-3.5 w-3.5 text-amber-400/70" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">{label}</p>
                <p className="text-[13px] font-medium text-white/70 mt-0.5 truncate">{value || "—"}</p>
            </div>
        </div>
    );
}

export default function ViewUserPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [id, setId] = useState("");
    const [showDelete, setShowDelete] = useState(false);

    useEffect(() => {
        params.then(({ id }) => {
            setId(id);
            getUserById(id)
                .then((res) => setUser(res.data))
                .finally(() => setLoading(false));
        });
    }, [params]);

    const handleDelete = async () => {
        await deleteUser(id);
        router.push("/admin/dashboard");
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400/60" />
        </div>
    );

    if (!user) return (
        <div className="text-center py-20 text-white/20 text-[13px]">User not found.</div>
    );

    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" })
        : "—";

    return (
        <div className="max-w-xl space-y-4">

            {/* Back nav */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                >
                    <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <h1 className="text-[15px] font-semibold text-white/80">User Profile</h1>
            </div>

            {/* Profile card */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">

                {/* Hero */}
                <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center border-b border-white/[0.06]">
                    {/* subtle grid bg */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                    <div className="relative h-20 w-20 rounded-full overflow-hidden ring-1 ring-white/10 shadow-xl">
                        {user.profileImage ? (
                            <Image src={user.profileImage} alt={user.fullName} width={80} height={80} unoptimized className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0a0c12] text-2xl font-black">
                                {user.fullName?.[0]?.toUpperCase() ?? "U"}
                            </div>
                        )}
                    </div>

                    <h2 className="text-[17px] font-bold text-white mt-3 tracking-tight">{user.fullName}</h2>
                    <p className="text-[12px] text-white/30 mt-0.5">@{user.username}</p>

                    <span className={`mt-3 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-widest border ${user.role === "admin"
                        ? "bg-violet-400/10 text-violet-400 border-violet-400/20"
                        : "bg-blue-400/10 text-blue-400 border-blue-400/20"
                        }`}>
                        {user.role}
                    </span>
                </div>

                {/* Details */}
                <div className="px-5 py-2">
                    <p className="text-[10px] font-bold text-white/15 uppercase tracking-widest pt-3 pb-1">Details</p>
                    <InfoRow icon={User} label="Full Name" value={user.fullName} />
                    <InfoRow icon={AtSign} label="Username" value={`@${user.username}`} />
                    <InfoRow icon={Mail} label="Email" value={user.email} />
                    <InfoRow icon={Phone} label="Phone" value={user.phone} />
                    <InfoRow icon={Shield} label="Role" value={user.role} />
                    <InfoRow icon={Calendar} label="Member since" value={joinedDate} />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
                <Link
                    href={`/admin/users/${id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-400 text-[#0a0c12] text-[13px] font-bold hover:bg-amber-300 transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit User
                </Link>
                <button
                    onClick={() => setShowDelete(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 text-red-400/70 text-[13px] font-semibold hover:text-red-400 hover:bg-red-400/[0.06] hover:border-red-400/30 transition-all"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                </button>
            </div>

            <DeleteModal
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title="Delete User"
                description={`Are you sure you want to delete "${user.fullName}"? This cannot be undone.`}
            />
        </div>
    );
}