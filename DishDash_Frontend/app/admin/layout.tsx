"use client";

import { useState } from "react";
import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-muted/30">
            <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <div className="lg:ml-60">
                <AdminHeader onMenuClick={() => setMobileOpen(true)} />
                <main className="p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}