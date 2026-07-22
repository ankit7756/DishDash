import UserHeader from "./_components/UserHeader";
import UserFooter from "./_components/UserFooter";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <UserHeader />
            <main className="flex-1">
                {children}
            </main>
            <UserFooter />
        </div>
    );
}