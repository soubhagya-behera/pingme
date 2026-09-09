import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { scrollToSection } from "./scrollToSection";

const SECTIONS = [
    { label: "Features", target: "features" },
    { label: "How it works", target: "how-it-works" },
    { label: "Security", target: "security" },
    { label: "About the platform", target: "about" }
];

/* Product links lead into the authenticated app; unauthenticated
   visitors are redirected to login by the existing route guards. */
const PRODUCT = [
    { label: "Chat", path: "/chat" },
    { label: "Friends", path: "/friends" },
    { label: "Requests", path: "/requests" },
    { label: "Settings", path: "/settings" }
];

export default function Footer() {
    return (
        <footer className="lp-footer">
            <div className="lp-footer-inner">
                <div className="lp-footer-grid">
                    <div className="lp-footer-brand">
                        <Link to="/" className="lp-logo" aria-label="PingMe home">
                            <span className="lp-logo-mark" aria-hidden="true">
                                <MessageCircle size={18} strokeWidth={2.4} />
                            </span>
                            <span className="lp-logo-word">Ping<em>Me</em></span>
                        </Link>
                        <p>Real-time conversations, beautifully connected.</p>
                    </div>

                    <nav className="lp-footer-col" aria-label="Footer — explore">
                        <h4>Explore</h4>
                        <ul>
                            {SECTIONS.map(item => (
                                <li key={item.target}>
                                    <button type="button" onClick={() => scrollToSection(item.target)}>
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    </nav>

                    <nav className="lp-footer-col" aria-label="Footer — product">
                        <h4>Product</h4>
                        <ul>
                            {PRODUCT.map(item => (
                                <li key={item.path}><Link to={item.path}>{item.label}</Link></li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="lp-footer-base">
                    <span>© 2026 PingMe. All rights reserved.</span>
                    <span>PINGME NETWORK · EST. IN REAL TIME</span>
                </div>
            </div>
        </footer>
    );
}
