import { useEffect, useState, useRef, useCallback, useMemo } from "react";

export default function useConnectivity() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [banner, setBanner] = useState(null);
  const syncTimeoutRef = useRef(null);
  const bannerRef = useRef(banner);
  useEffect(() => { bannerRef.current = banner; }, [banner]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      setBanner("offline");
    } else {
      if (bannerRef.current === "offline") setBanner("syncing");
    }
  }, [isOnline]);

  const notifySynced = useCallback(() => {
    // read latest online via navigator to avoid stale isOnline closure
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setBanner("synced");
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => setBanner(null), 2500);
  }, []);

  const notifySyncing = useCallback(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setBanner("syncing");
  }, []);

  useEffect(() => () => clearTimeout(syncTimeoutRef.current), []);

  return useMemo(() => ({ isOnline, banner, notifySynced, notifySyncing, setBanner }), [isOnline, banner, notifySynced, notifySyncing]);
}
