// lib/notifications.ts
// localStorage-based notification system — no backend needed

export type NotificationType = "order" | "profile" | "promo" | "review";

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    isPromo: boolean;
    createdAt: string; // ISO string (localStorage can't store Date)
}

const STORAGE_KEY = "foodify_notifications";

// ── Hardcoded promo notifications (always shown, never stored) ────────────────
export const PROMO_NOTIFICATIONS: AppNotification[] = [
    {
        id: "promo_1",
        title: "🎉 Weekend Special!",
        message: "Get 20% off on all orders above Rs. 500 this weekend. Use code WEEKEND20.",
        type: "promo",
        isRead: true,
        isPromo: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: "promo_2",
        title: "🆓 Free Delivery Friday",
        message: "Every Friday, enjoy free delivery on your first order of the day. No minimum order!",
        type: "promo",
        isRead: true,
        isPromo: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: "promo_3",
        title: "⭐ Refer & Earn",
        message: "Invite a friend to Foodify and both of you get Rs. 100 off your next order.",
        type: "promo",
        isRead: true,
        isPromo: true,
        createdAt: new Date().toISOString(),
    },
];

// ── Read from localStorage ────────────────────────────────────────────────────
export function getNotifications(): AppNotification[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

// ── Write to localStorage ─────────────────────────────────────────────────────
function saveNotifications(notifications: AppNotification[]) {
    if (typeof window === "undefined") return;
    // Keep max 50 so localStorage doesn't grow forever
    const trimmed = notifications.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

// ── Add a new notification ────────────────────────────────────────────────────
export function addNotification(
    title: string,
    message: string,
    type: NotificationType = "order"
) {
    const existing = getNotifications();
    const notification: AppNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title,
        message,
        type,
        isRead: false,
        isPromo: false,
        createdAt: new Date().toISOString(),
    };
    saveNotifications([notification, ...existing]);

    // Dispatch custom event so the header bell updates without a page reload
    window.dispatchEvent(new Event("foodify_notification"));
}

// ── Mark all as read ──────────────────────────────────────────────────────────
export function markAllRead() {
    const notifications = getNotifications().map((n) => ({ ...n, isRead: true }));
    saveNotifications(notifications);
    window.dispatchEvent(new Event("foodify_notification"));
}

// ── Delete one notification ───────────────────────────────────────────────────
export function deleteNotification(id: string) {
    const notifications = getNotifications().filter((n) => n.id !== id);
    saveNotifications(notifications);
    window.dispatchEvent(new Event("foodify_notification"));
}

// ── Clear all non-promo notifications ────────────────────────────────────────
export function clearAllNotifications() {
    saveNotifications([]);
    window.dispatchEvent(new Event("foodify_notification"));
}

// ── Count unread (non-promo only) ─────────────────────────────────────────────
export function getUnreadCount(): number {
    return getNotifications().filter((n) => !n.isRead && !n.isPromo).length;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function formatNotifTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-NP", { month: "short", day: "numeric" });
}

export function getTypeEmoji(type: NotificationType): string {
    switch (type) {
        case "order": return "🛵";
        case "profile": return "👤";
        case "review": return "⭐";
        case "promo": return "🎁";
    }
}

export function getTypeBg(type: NotificationType): string {
    switch (type) {
        case "order": return "bg-orange-100 dark:bg-orange-900/30";
        case "profile": return "bg-blue-100 dark:bg-blue-900/30";
        case "review": return "bg-amber-100 dark:bg-amber-900/30";
        case "promo": return "bg-yellow-100 dark:bg-yellow-900/30";
    }
}