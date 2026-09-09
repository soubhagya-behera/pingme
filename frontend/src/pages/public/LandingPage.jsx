import { useEffect } from "react";

import LandingNavbar from "../../components/landing/LandingNavbar";
import HeroContent from "../../components/landing/HeroContent";
import FeaturesSection from "../../components/landing/FeaturesSection";
import ProductShowcase from "../../components/landing/ProductShowcase";
import HowItWorks from "../../components/landing/HowItWorks";
import SecuritySection from "../../components/landing/SecuritySection";
import TechSection from "../../components/landing/TechSection";
import FinalCTA from "../../components/landing/FinalCTA";
import Footer from "../../components/landing/Footer";

import { maybeRunViewportAudit } from "../../dev/viewportAudit";

import "../../styles/landing.css";

const TRUST_ITEMS = [
    { value: "<1s", label: "Latency" },
    { value: "P2P", label: "Peer-to-Peer" },
    { value: "24/7", label: "Availability" }
];

export default function LandingPage() {
    maybeRunViewportAudit();

    useEffect(() => {
        const previousTitle = document.title;
        document.title = "PingMe — Real-Time Messaging";

        const meta = document.querySelector('meta[name="description"]');
        const previousDescription = meta?.getAttribute("content");
        meta?.setAttribute(
            "content",
            "PingMe is a real-time messaging app with instant chat, friends, live presence, voice messages, files and WebRTC audio/video calls."
        );

        return () => {
            document.title = previousTitle;
            if (previousDescription !== null && meta) {
                meta.setAttribute("content", previousDescription);
            }
        };
    }, []);

    return (
        <div className="landing">
            <LandingNavbar />
            <main>
                <HeroContent />

                <div className="lp-truststrip" aria-label="Product highlights">
                    <div className="lp-truststrip-inner">
                        {TRUST_ITEMS.map(item => (
                            <div className="lp-trust-item" key={item.value}>
                                <b><em>{item.value}</em></b>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <FeaturesSection />
                <ProductShowcase />
                <HowItWorks />
                <SecuritySection />
                <TechSection />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
}
