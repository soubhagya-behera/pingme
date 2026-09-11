export default function OfflineBanner({ banner }) {
  if (!banner) return null;
  let text = "";
  let cls = "offline-banner";
  if (banner === "offline") {
    text = "Offline · Messages will send when you're back online";
    cls += " is-offline";
  } else if (banner === "syncing") {
    text = "Back online · Syncing...";
    cls += " is-syncing";
  } else if (banner === "synced") {
    text = "All messages synced";
    cls += " is-synced";
  } else return null;
  return <div className={cls} role="status" aria-live="polite">{text}</div>;
}
