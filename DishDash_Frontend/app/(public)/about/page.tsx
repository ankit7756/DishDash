import { UtensilsCrossed, Target, Users, Rocket } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container py-16 max-w-3xl">
            <div className="text-center mb-12">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white mx-auto mb-4">
                    <UtensilsCrossed className="h-7 w-7" />
                </div>
                <h1 className="text-3xl font-bold text-secondary mb-3">About DishDash</h1>
                <p className="text-text-muted text-lg">
                    Connecting hungry people with the food they love, one order at a time.
                </p>
            </div>

            <div className="card p-8 mb-8">
                <p className="text-text leading-relaxed">
                    DishDash is a food delivery platform built to make ordering from your favorite local
                    restaurants simple, fast, and secure. From browsing menus to real-time order tracking
                    and secure payments through Khalti, every part of the experience is designed around
                    speed and trust.
                </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
                {[
                    { icon: Target, title: "Our Mission", desc: "Deliver great food, fast, without compromising on security or reliability." },
                    { icon: Users, title: "For Everyone", desc: "Whether you're craving momos or a full meal, we've got a restaurant for you." },
                    { icon: Rocket, title: "Built to Scale", desc: "A modern, secure platform designed with real-world engineering practices." },
                ].map((item) => (
                    <div key={item.title} className="text-center">
                        <div className="h-11 w-11 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                            <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-secondary mb-1">{item.title}</h3>
                        <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}