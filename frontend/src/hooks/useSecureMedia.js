import { useEffect, useState } from "react";
import { getApiOrigin } from "../api/axios";

/**
 * Authenticated media loading (C1, option A).
 *
 * <p>&lt;img&gt;/&lt;audio&gt; tags cannot send the Authorization header, so private
 * files served by GET /api/files/... are fetched with the JWT and exposed as blob
 * URLs. Uploaded paths map to /api/files routes; external/blob URLs pass through
 * unchanged. Blob URLs are cached per (token, path) so chat lists don't refetch.</p>
 */

const blobCache = new Map();

function isUsableToken(value) {
    return typeof value === "string" &&
        value.trim() !== "" &&
        value !== "null" &&
        value !== "undefined";
}

function toApiPath(path) {
    if (path.startsWith("/uploads/chat-files/")) {
        return "/api/files/chat-files/" + path.slice("/uploads/chat-files/".length);
    }
    if (path.startsWith("/uploads/chat-images/")) {
        return "/api/files/chat-images/" + path.slice("/uploads/chat-images/".length);
    }
    if (path.startsWith("/uploads/profile-photos/")) {
        return "/api/files/profile-photos/" + path.slice("/uploads/profile-photos/".length);
    }
    return null;
}

const MAX_CACHE_ENTRIES = 200;

function cacheBlob(key, objectUrl) {
    if (blobCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = blobCache.keys().next().value;
        const oldest = blobCache.get(oldestKey);
        blobCache.delete(oldestKey);
        try { URL.revokeObjectURL(oldest); } catch { /* ignore */ }
    }
    blobCache.set(key, objectUrl);
}

/** Discard all cached blob URLs (e.g. on logout / account switch). */
export function clearMediaCache() {
    blobCache.forEach((objectUrl) => {
        try { URL.revokeObjectURL(objectUrl); } catch { /* ignore */ }
    });
    blobCache.clear();
}

const PASSTHROUGH = /^(https?:)?\/\//i;

export function useSecureMedia(raw) {
    const [url, setUrl] = useState("");

    useEffect(() => {
        let cancelled = false;

        if (!raw) {
            setUrl("");
            return undefined;
        }

        // External URLs and already-resolved blob URLs don't need authentication.
        if (PASSTHROUGH.test(raw) || raw.startsWith("blob:")) {
            setUrl(raw);
            return undefined;
        }

        const apiPath = toApiPath(raw);
        if (!apiPath) {
            setUrl(raw);
            return undefined;
        }

        const token = localStorage.getItem("token");
        if (!isUsableToken(token)) {
            setUrl("");
            return undefined;
        }

        const key = `${token}|${apiPath}`;
        const cached = blobCache.get(key);
        if (cached) {
            setUrl(cached);
            return undefined;
        }

        (async () => {
            try {
                const response = await fetch(getApiOrigin() + apiPath, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok || cancelled) {
                    if (!cancelled) setUrl("");
                    return;
                }
                const blob = await response.blob();
                if (cancelled) return;
                const objectUrl = URL.createObjectURL(blob);
                cacheBlob(key, objectUrl);
                setUrl(objectUrl);
            } catch {
                if (!cancelled) setUrl("");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [raw]);

    return url;
}