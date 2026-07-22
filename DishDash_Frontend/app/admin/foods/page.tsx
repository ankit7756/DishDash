"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, X, Flame } from "lucide-react";
import { adminGetFoods, adminCreateFood, adminUpdateFood, adminDeleteFood } from "@/lib/api/admin-api";
import { adminGetRestaurants } from "@/lib/api/admin-api";
import DeleteModal from "@/app/_components/DeleteModal";

const CATEGORIES = ["Burgers", "Pizza", "Momos", "Rice", "Noodles", "Drinks", "Desserts", "Snacks", "Thali", "Salads", "Sandwiches", "Other"];

function FoodModal({ initial, restaurants, onSave, onClose }: {
    initial?: any; restaurants: any[];
    onSave: (fd: FormData) => Promise<void>; onClose: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [restaurantId, setRestaurantId] = useState(initial?.restaurantId?._id ?? initial?.restaurantId ?? "");
    const [category, setCategory] = useState(initial?.category ?? "");
    const [price, setPrice] = useState(initial?.price ?? "");
    const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
    const [isPopular, setIsPopular] = useState(initial?.isPopular ?? false);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        setFile(f); setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(null);
        if (!initial && !file) { setError("Food image is required"); return; }
        if (!restaurantId) { setError("Please select a restaurant"); return; }

        const fd = new FormData();
        fd.append("name", name);
        fd.append("description", description);
        fd.append("restaurantId", restaurantId);
        fd.append("category", category);
        fd.append("price", String(price));
        fd.append("isAvailable", String(isAvailable));
        fd.append("isPopular", String(isPopular));
        if (file) fd.append("image", file);

        setLoading(true);
        try { await onSave(fd); onClose(); }
        catch (err: any) { setError(err.message ?? "Failed"); }
        finally { setLoading(false); }
    };

    const inputCls = "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white/90 focus:outline-none focus:ring-1 focus:ring-amber-400/60 focus:border-amber-400/40 placeholder:text-white/20 transition-all";
    const currentImg = preview ?? initial?.image ?? null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#13161f] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl shadow-black/60 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] sticky top-0 bg-[#13161f] rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-[14px] font-semibold text-white/90">{initial ? "Edit Food" : "New Food Item"}</h2>
                        <p className="text-[11px] text-white/25 mt-0.5">{initial ? "Update food details" : "Add a new item to the menu"}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Image */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] flex-shrink-0 cursor-pointer hover:border-amber-400/30 transition-colors"
                            onClick={() => fileRef.current?.click()}>
                            {currentImg ? (
                                <Image src={currentImg} alt="Preview" width={64} height={64} unoptimized className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/15 text-[10px] text-center px-1">
                                    Click to upload
                                </div>
                            )}
                        </div>
                        <div>
                            <button type="button" onClick={() => fileRef.current?.click()}
                                className="text-[12px] font-semibold text-amber-400/70 hover:text-amber-400 transition-colors">
                                {file ? "Change image" : "Upload image"}
                            </button>
                            <p className="text-[11px] text-white/20 mt-0.5">JPG / PNG · Max 5MB</p>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Food Name *</label>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chicken Burger" className={inputCls} required />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Description *</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." className={`${inputCls} resize-none h-16`} required />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Restaurant *</label>
                            <select value={restaurantId} onChange={e => setRestaurantId(e.target.value)} className={inputCls} required>
                                <option value="">Select restaurant</option>
                                {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Category *</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls} required>
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Price (Rs) *</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="250" className={inputCls} required />
                        </div>

                        {/* Toggles */}
                        <div className="col-span-2 flex items-center gap-6 pt-1">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isAvailable ? "bg-emerald-500 border-emerald-500" : "border-white/20 bg-transparent"}`}
                                    onClick={() => setIsAvailable(!isAvailable)}>
                                    {isAvailable && <span className="text-white text-[9px] font-bold">✓</span>}
                                </div>
                                <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="hidden" />
                                <span className="text-[12px] text-white/50 group-hover:text-white/70 transition-colors">Available</span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isPopular ? "bg-amber-400 border-amber-400" : "border-white/20 bg-transparent"}`}
                                    onClick={() => setIsPopular(!isPopular)}>
                                    {isPopular && <span className="text-[#0a0c12] text-[9px] font-bold">✓</span>}
                                </div>
                                <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} className="hidden" />
                                <span className="text-[12px] text-white/50 group-hover:text-white/70 transition-colors">Mark as Popular</span>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-[12px] text-red-400">{error}</div>
                    )}

                    <div className="flex gap-2.5 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-white/[0.08] text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 rounded-lg bg-amber-400 text-[#0a0c12] text-[13px] font-bold hover:bg-amber-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : initial ? "Save changes" : "Add food"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function FoodsPage() {
    const [foods, setFoods] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; data?: any }>({ open: false });
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    useEffect(() => {
        adminGetRestaurants("1", "100").then(r => setRestaurants(r.data ?? []));
    }, []);

    const fetchFoods = async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminGetFoods(String(page), "10", search || undefined);
            setFoods(res.data ?? []);
            setPagination(res.pagination ?? { page: 1, totalPages: 1, totalItems: 0 });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchFoods(1); }, [search]);

    const handleSave = async (fd: FormData, id?: string) => {
        if (id) await adminUpdateFood(id, fd);
        else await adminCreateFood(fd);
        fetchFoods(pagination.page);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await adminDeleteFood(deleteTarget._id);
        setDeleteTarget(null);
        fetchFoods(1);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Foods</h1>
                    <p className="text-[13px] text-white/30 mt-0.5">Manage all food items across restaurants</p>
                </div>
                <button
                    onClick={() => setModal({ open: true })}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-[#0a0c12] text-[13px] font-bold hover:bg-amber-300 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Add Food
                </button>
            </div>

            {/* Search */}
            <form
                onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}
                className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 w-full max-w-sm"
            >
                <Search className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
                <input
                    type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search foods..."
                    className="flex-1 text-[13px] text-white/70 bg-transparent outline-none placeholder:text-white/20"
                />
            </form>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-400/60" />
                </div>
            ) : (
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="border-b border-white/[0.05]">
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Food</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Restaurant</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Category</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Price</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {foods.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-white/20 text-[13px]">No food items found</td>
                                    </tr>
                                ) : foods.map((food) => (
                                    <tr key={food._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0 ring-1 ring-white/[0.06]">
                                                    {food.image && <Image src={food.image} alt={food.name} width={36} height={36} unoptimized className="object-cover w-full h-full" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white/80">{food.name}</p>
                                                    {food.isPopular && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Flame className="h-2.5 w-2.5 text-amber-400" />
                                                            <span className="text-[10px] font-bold text-amber-400/70">Popular</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-white/30 text-[12px]">{food.restaurantId?.name ?? "—"}</td>
                                        <td className="px-5 py-3">
                                            <span className="text-[11px] text-white/35 bg-white/[0.04] px-2 py-0.5 rounded">{food.category}</span>
                                        </td>
                                        <td className="px-5 py-3 font-semibold text-white/70">Rs. {food.price}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border ${food.isAvailable
                                                    ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                                                    : "bg-red-400/10 text-red-400 border-red-400/20"
                                                }`}>
                                                {food.isAvailable ? "Available" : "Unavailable"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setModal({ open: true, data: food })}
                                                    className="p-1.5 rounded-md text-white/25 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(food)}
                                                    className="p-1.5 rounded-md text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                            <p className="text-[11px] text-white/20">{pagination.totalItems} foods</p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => fetchFoods(pagination.page - 1)} disabled={pagination.page === 1}
                                    className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => fetchFoods(p)}
                                        className={`h-7 w-7 rounded-md text-[12px] font-semibold transition-all ${p === pagination.page ? "bg-amber-400 text-[#0a0c12]" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"}`}>
                                        {p}
                                    </button>
                                ))}
                                <button onClick={() => fetchFoods(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                                    className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {modal.open && (
                <FoodModal initial={modal.data} restaurants={restaurants} onSave={(fd) => handleSave(fd, modal.data?._id)} onClose={() => setModal({ open: false })} />
            )}
            <DeleteModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete Food" description={`Delete "${deleteTarget?.name}"? This cannot be undone.`} />
        </div>
    );
}