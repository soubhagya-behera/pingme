/**
 * Public (unauthenticated) routes. Session-expiry handlers must NOT
 * redirect to /login when the user is already on a public page — e.g. a
 * stale/expired token in localStorage must not yank the visitor off the
 * landing page. Stale credentials are still cleared, just silently.
 */
export const PUBLIC_AUTH_PATHS = new Set([
    "/",
    "/login",
    "/register",
    "/register-success",
    "/activate",
    "/forgot-password"
]);

export function isPublicAuthPath(pathname) {
    return PUBLIC_AUTH_PATHS.has(pathname);
}
