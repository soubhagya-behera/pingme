import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Menu, X } from "lucide-react";

import { scrollToSection } from "./scrollToSection";

const LINKS = [
    { label: "Features", target: "features" },
    { label: "How it works", target: "how-it-works" },
    { label: "Security", target: "security" },
    { label: "About", target: "about" }
];

export default function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // While the mobile menu is open: lock page scroll and close on Escape.
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false);
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    // Close the menu if the viewport grows into desktop navigation.
    useEffect(() => {
        if (!open) return;
        const media = window.matchMedia("(min-width: 900px)");
        const onChange = (event) => {
            if (event.matches) setOpen(false);
        };
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, [open]);

    const handleSection = (target) => {
        setOpen(false);
        scrollToSection(target);
    };

    return (
        <>
            <header className={`lp-nav${scrolled || open ? " is-scrolled" : ""}`}>
                <div className="lp-nav-inner">
                    <Link to="/" className="lp-logo" aria-label="PingMe home">
                        <span className="lp-logo-mark" aria-hidden="true">
                            <MessageCircle size={18} strokeWidth={2.4} />
                        </span>
                        <span className="lp-logo-word">
                            Ping<em>Me</em>
                        </span>
                    </Link>

                    <nav className="lp-links" aria-label="Landing navigation">
                        {LINKS.map(link => (
                            <button
                                key={link.target}
                                type="button"
                                className="lp-link"
                                onClick={() => handleSection(link.target)}
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>

                    <div className="lp-nav-actions">
                        <Link to="/login" className="lp-login-link">Login</Link>
                        <Link to="/login" className="lp-btn lp-btn-primary lp-btn-sm">
                            Get Started
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="lp-menu-toggle"
                        aria-expanded={open}
                        aria-controls="lp-mobile-menu"
                        aria-label={open ? "Close menu" : "Open menu"}
                        onClick={() => setOpen(value => !value)}
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            {open && (
                <>
                    {/* Click-away layer */}
                    <button
                        type="button"
                        className="lp-menu-backdrop"
                        aria-label="Close menu"
                        tabIndex={-1}
                        onClick={() => setOpen(false)}
                    />
                    <div
                        className="lp-mobile-menu"
                        id="lp-mobile-menu"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site menu"
                    >
                        <nav aria-label="Mobile navigation">
                            {LINKS.map(link => (
                                <button
                                    key={link.target}
                                    type="button"
                                    className="lp-mobile-link"
                                    onClick={() => handleSection(link.target)}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </nav>
                        <div className="lp-mobile-actions">
                            <Link
                                to="/login"
                                className="lp-btn lp-btn-ghost lp-btn-sm"
                                onClick={() => setOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/login"
                                className="lp-btn lp-btn-primary lp-btn-sm"
                                onClick={() => setOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </>
  );
}
