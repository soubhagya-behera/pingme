/*
 * TEMPORARY responsive-audit instrumentation.
 * Active ONLY when the page URL contains "?vp-audit".
 * Logs layout overflow metrics to the console for headless testing.
 * This file is deleted after the audit run.
 */

function auditViewport() {
    const doc = document.documentElement;
    const body = document.body;
    const clientW = doc.clientWidth;
    const docScrollW = Math.max(doc.scrollWidth, body.scrollWidth);
    const overflowX = docScrollW - clientW;

    const offenders = [];
    document.querySelectorAll("body *").forEach(el => {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return;

        // Skip anything inside an overflow-clipped subtree (hero decor is
        // intentionally bled off-canvas and clipped there).
        let clipped = false;
        let p = el.parentElement;
        while (p && p !== document.body) {
            const pcs = getComputedStyle(p);
            if (pcs.overflowX === "clip" || pcs.overflowX === "hidden") { clipped = true; break; }
            p = p.parentElement;
        }
        if (clipped) return;

        if (rect.right > clientW + 1 || rect.left < -1) {
            if (offenders.length < 8) {
                offenders.push(
                    `${el.tagName}.${String(el.className).slice(0, 44)} L${Math.round(rect.left)} R${Math.round(rect.right)}`
                );
            }
        }
    });

    const featureTitles = [...document.querySelectorAll(".lp-cell h3")].map(h => {
        const r = h.getBoundingClientRect();
        return `${h.textContent.slice(0, 22)}:${Math.round(r.width)}w`;
    });

    // eslint-disable-next-line no-console
    console.log(
        `VP-AUDIT ${window.innerWidth}x${window.innerHeight} dpr=${window.devicePixelRatio} ` +
        `overflowX=${overflowX} scrollW=${docScrollW} clientW=${clientW} ` +
        `offenders=[${offenders.join(" | ")}] titles[${featureTitles.join(", ")}]`
    );
}

export function maybeRunViewportAudit() {
    if (!window.location.search.includes("vp-audit")) return;
    // late enough for fonts/layout/reveals, plus a second pass later
    setTimeout(auditViewport, 2500);
    setTimeout(auditViewport, 5000);
}
