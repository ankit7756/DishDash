import Header from "./_components/Header";
import Footer from "./_components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </section>
    );
}