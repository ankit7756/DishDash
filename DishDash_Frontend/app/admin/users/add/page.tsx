"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import UserForm from "@/app/admin/_components/UserForm";
import { createUser } from "@/lib/api/admin/user";

export default function AddUserPage() {
    const router = useRouter();

    const handleSubmit = useCallback(async (fd: FormData) => {
        try {
            const res = await createUser(fd);
            if (res.success) {
                setTimeout(() => router.push("/admin/dashboard"), 1200);
                return { success: true };
            }
            return { success: false, message: res.message };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }, [router]);

    return (
        <div className="space-y-5">
            {/* Back nav */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                >
                    <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <div>
                    <h1 className="text-[15px] font-semibold text-white/80 tracking-tight">Add New User</h1>
                    <p className="text-[11px] text-white/25 mt-0.5">Create a new user account</p>
                </div>
            </div>

            <UserForm mode="add" onSubmit={handleSubmit} />
        </div>
    );
}