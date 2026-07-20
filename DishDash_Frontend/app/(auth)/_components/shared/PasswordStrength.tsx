"use client";

// Lightweight, dependency-free strength indicator (5 tiers), mirroring the
// backend's checks (length >= 12, upper/lower/number/special) plus a bonus
// tier for length beyond the minimum — gives real-time feedback without
// bundling the full zxcvbn library on the client.
const scorePassword = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: "", color: "bg-border" };

    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const tiers = [
        { label: "Too short", color: "bg-danger" },
        { label: "Weak", color: "bg-danger" },
        { label: "Fair", color: "bg-warning" },
        { label: "Good", color: "bg-primary" },
        { label: "Strong", color: "bg-accent" },
        { label: "Excellent", color: "bg-accent" },
    ];

    return { score, ...tiers[Math.min(score, tiers.length - 1)] };
};

export default function PasswordStrength({ password }: { password: string }) {
    const { score, label, color } = scorePassword(password);
    if (!password) return null;

    return (
        <div className="mt-1.5">
            <div className="flex gap-1 h-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors ${i < score ? color : "bg-border"}`}
                    />
                ))}
            </div>
            <p className="text-xs text-text-muted mt-1">{label}</p>
        </div>
    );
}