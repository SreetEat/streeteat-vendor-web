import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
    const { user, vendorId } = useAuth();

    return (
        <div className="market-glow relative overflow-hidden">
            <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
                <p className="enter-up font-mono text-xs uppercase tracking-[0.2em] text-chili-400">
                    for street food vendors
                </p>
                <h1
                    className="enter-up mt-4 font-display text-5xl font-extrabold leading-[1.05] text-paper-50 sm:text-6xl"
                    style={{ animationDelay: "0.1s" }}
                >
                    Run your stall,
                    <br />
                    <span className="text-marigold-500">not your paperwork.</span>
                </h1>
                <p className="enter-up mx-auto mt-6 max-w-xl text-lg text-dusk-200" style={{ animationDelay: "0.2s" }}>
                    List your menu, get discovered by hungry customers nearby, and manage every
                    order from one screen — accept, prep, and hand off for delivery in a couple of taps.
                </p>

                <div className="enter-up mt-10 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "0.3s" }}>
                    {user ? (
                        <Link
                            to={vendorId ? "/dashboard" : "/setup"}
                            className="rounded-full bg-marigold-500 px-7 py-3 font-semibold text-dusk-950 shadow-[0_8px_24px_-6px_rgba(255,177,0,0.5)] transition hover:scale-[1.03] hover:bg-marigold-400"
                        >
                            {vendorId ? "Go to your dashboard →" : "Finish setting up your stall →"}
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/auth"
                                className="rounded-full bg-marigold-500 px-7 py-3 font-semibold text-dusk-950 shadow-[0_8px_24px_-6px_rgba(255,177,0,0.5)] transition hover:scale-[1.03] hover:bg-marigold-400"
                            >
                                Create your stall →
                            </Link>
                            <Link
                                to="/auth"
                                className="rounded-full border border-dusk-600 px-7 py-3 font-semibold text-dusk-200 transition hover:border-marigold-500 hover:text-marigold-300"
                            >
                                Log in
                            </Link>
                        </>
                    )}
                </div>

                <div className="enter-up mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-3" style={{ animationDelay: "0.4s" }}>
                    <FeatureCard title="List your menu" body="Add dishes with photos and prices in minutes. Mark items sold out with one tap." />
                    <FeatureCard title="Get real orders" body="Customers find you by location and order straight from your stall — no middleman menu." />
                    <FeatureCard title="Hand off smoothly" body="Mark an order ready and the nearest delivery partner is found automatically." />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ title, body }) {
    return (
        <div className="stall-card p-5">
            <h3 className="font-display text-lg font-bold text-marigold-400">{title}</h3>
            <p className="mt-1.5 text-sm text-dusk-200">{body}</p>
        </div>
    );
}