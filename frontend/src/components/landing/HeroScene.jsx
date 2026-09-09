import { useEffect, useRef } from "react";

/*
 * Lightweight Canvas 2D vaporwave environment:
 * dusk sky, striped retro sun, twinkling stars,
 * endless scrolling perspective grid and drifting data motes.
 * No 3D engine required. Renders a static frame when the user
 * prefers reduced motion and pauses when off-screen.
 */

function prefersReducedMotion() {
    return typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createStars(count) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random() * 0.62,
            r: Math.random() * 1.3 + 0.3,
            tw: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 1.2
        });
    }
    return stars;
}

function createMotes(count) {
    const motes = [];
    for (let i = 0; i < count; i++) {
        motes.push({
            x: Math.random(),
            y: 0.45 + Math.random() * 0.55,
            r: Math.random() * 1.8 + 0.6,
            vy: -(0.00018 + Math.random() * 0.0005),
            vx: (Math.random() - 0.5) * 0.00022,
            hue: Math.random() > 0.5 ? "167, 139, 250" : "103, 232, 249",
            a: 0.12 + Math.random() * 0.4
        });
    }
    return motes;
}

export default function HeroScene({ parallaxRef }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const reduced = prefersReducedMotion();

        let width = 0;
        let height = 0;
        let dpr = 1;
        let stars = [];
        let motes = [];
        let rafId = 0;
        let running = true;
        let visible = true;

        // eased mouse position in [-1, 1]
        const pointer = { x: 0, y: 0 };
        const target = { x: 0, y: 0 };

        function resize() {
            const rect = canvas.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.25 : 2);
            width = Math.max(rect.width, 1);
            height = Math.max(rect.height, 1);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const isMobile = width < 720;
            stars = createStars(isMobile ? 70 : 150);
            motes = createMotes(isMobile ? 16 : 34);
        }

        function onPointerMove(event) {
            target.x = (event.clientX / window.innerWidth) * 2 - 1;
            target.y = (event.clientY / window.innerHeight) * 2 - 1;
        }

        function drawSky(horizonY, t) {
            const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
            sky.addColorStop(0, "#05010f");
            sky.addColorStop(0.42, "#120a2e");
            sky.addColorStop(0.74, "#3b1a58");
            sky.addColorStop(0.92, "#7b2d6b");
            sky.addColorStop(1, "#c65a8a");
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, width, horizonY + 1);

            // Stars
            for (const star of stars) {
                const twinkle = reduced
                    ? 0.75
                    : 0.55 + 0.45 * Math.sin(t * 0.001 * star.speed + star.tw);
                ctx.globalAlpha = twinkle * 0.9;
                ctx.fillStyle = "#e9e4ff";
                ctx.beginPath();
                ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        function drawSun(cx, horizonY) {
            const radius = Math.min(width, height) * 0.19;
            const sunY = horizonY - radius * 0.52;

            ctx.save();
            // Outer glow
            const glow = ctx.createRadialGradient(cx, sunY, radius * 0.4, cx, sunY, radius * 2.1);
            glow.addColorStop(0, "rgba(244, 114, 182, 0.34)");
            glow.addColorStop(0.55, "rgba(139, 92, 246, 0.12)");
            glow.addColorStop(1, "rgba(139, 92, 246, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, horizonY + 2);

            // Disc with horizontal slits that thicken toward the bottom
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, sunY, radius, 0, Math.PI * 2);
            ctx.clip();

            const disc = ctx.createLinearGradient(0, sunY - radius, 0, sunY + radius);
            disc.addColorStop(0, "#ffe8a3");
            disc.addColorStop(0.32, "#ffb36b");
            disc.addColorStop(0.58, "#f472b6");
            disc.addColorStop(0.85, "#a855f7");
            disc.addColorStop(1, "#6d28d9");
            ctx.fillStyle = disc;
            ctx.fillRect(cx - radius, sunY - radius, radius * 2, radius * 2);

            ctx.globalCompositeOperation = "destination-out";
            let slitY = sunY + radius * 0.06;
            let slitH = 2;
            const step = radius * 0.13;
            while (slitY < sunY + radius) {
                ctx.fillRect(cx - radius, slitY, radius * 2, slitH);
                slitY += step;
                slitH += radius * 0.028;
            }
            ctx.restore();
            ctx.restore();
        }

        function drawFloor(t, cx, horizonY, shiftX) {
            const floorH = height - horizonY;
            if (floorH <= 4) return;

            const floor = ctx.createLinearGradient(0, horizonY, 0, height);
            floor.addColorStop(0, "#170b33");
            floor.addColorStop(0.5, "#0c0522");
            floor.addColorStop(1, "#05010f");
            ctx.fillStyle = floor;
            ctx.fillRect(0, horizonY, width, floorH);

            // Horizon glow line
            const line = ctx.createLinearGradient(cx - width * 0.5, horizonY, cx + width * 0.5, horizonY);
            line.addColorStop(0, "rgba(167, 139, 250, 0)");
            line.addColorStop(0.5, "rgba(233, 213, 255, 0.85)");
            line.addColorStop(1, "rgba(167, 139, 250, 0)");
            ctx.fillStyle = line;
            ctx.fillRect(0, horizonY - 1, width, 2);

            // Horizontal lines scrolling toward the viewer
            const lines = 17;
            for (let i = 0; i < lines; i++) {
                const phase = reduced ? i / lines : ((i + (t * 0.00011)) % lines) / lines;
                const depth = Math.pow(phase, 3.1);
                const y = horizonY + depth * floorH;
                const alpha = 0.05 + depth * 0.6;
                ctx.strokeStyle = `rgba(139, 92, 246, ${alpha.toFixed(3)})`;
                ctx.lineWidth = 1 + depth * 1.15;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Vertical converging lines
            const spread = 26;
            const vanishDrift = shiftX * 46;
            for (let i = -spread; i <= spread; i++) {
                const nearX = cx + i * (width / spread) * 1.35;
                const farX = cx + vanishDrift * 0.25 + i * (width / spread) * 0.028;
                ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(farX, horizonY);
                ctx.lineTo(nearX, height);
                ctx.stroke();
            }
        }

        function drawMotes(t) {
            for (const mote of motes) {
                const y = reduced ? mote.y : ((mote.y + t * mote.vy) % 0.62 + 0.62) % 0.62 + 0.38;
                const x = reduced ? mote.x : ((mote.x + t * mote.vx) % 1 + 1) % 1;
                ctx.fillStyle = `rgba(${mote.hue}, ${mote.a})`;
                ctx.beginPath();
                ctx.arc(x * width, y * height, mote.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function render(t) {
            // ease pointer for smooth parallax
            pointer.x += (target.x - pointer.x) * 0.045;
            pointer.y += (target.y - pointer.y) * 0.045;

            const shiftX = pointer.x;
            const shiftY = pointer.y;
            const isMobileView = width < 768;
            const horizonFactor = isMobileView ? 0.52 : 0.62;
            const horizonY = height * horizonFactor + shiftY * 10;
            const cx = width / 2 - shiftX * 26;

            drawSky(horizonY, t);
            drawSun(cx, horizonY);
            drawMotes(t);
            drawFloor(t, cx, horizonY, shiftX);

            if (parallaxRef?.current) {
                parallaxRef.current.style.setProperty("--par-x", `${(-shiftX * 14).toFixed(2)}px`);
                parallaxRef.current.style.setProperty("--par-y", `${(-shiftY * 10).toFixed(2)}px`);
            }
        }

        function loop(t) {
            if (!running) return;
            render(t);
            rafId = requestAnimationFrame(loop);
        }

        function start() {
            if (reduced) {
                render(4000); // calm static composition
                return;
            }
            running = true;
            rafId = requestAnimationFrame(loop);
        }

        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
        }

        resize();

        const observer = new ResizeObserver(() => {
            resize();
            if (reduced || !running) render(performance.now());
        });
        observer.observe(canvas);

        const intersection = new IntersectionObserver(entries => {
            visible = entries[0]?.isIntersecting ?? true;
            if (!reduced) {
                if (visible && !running && !document.hidden) start();
                if (!visible && running) stop();
            }
        }, { threshold: 0.02 });
        intersection.observe(canvas);

        const onVisibility = () => {
            if (reduced) return;
            if (document.hidden) stop();
            else if (visible) start();
        };

        if (!reduced) {
            window.addEventListener("pointermove", onPointerMove, { passive: true });
            document.addEventListener("visibilitychange", onVisibility);
            start();
        } else {
            render(4000);
        }

        return () => {
            stop();
            observer.disconnect();
            intersection.disconnect();
            window.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [parallaxRef]);

    return (
        <canvas
            ref={canvasRef}
            className="lp-hero-canvas"
            aria-hidden="true"
        />
    );
}
