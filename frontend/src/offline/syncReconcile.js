// B-block: pure message-list reconciliation for outbox sync events.
// Kept in this small module (not Chat.jsx) to respect the 400-line rule.
// Behaviour is byte-identical to the previous inline handler in Chat.jsx,
// plus the "retry" event that flips a requeued row back to PENDING.
export function applySyncEventToMessages(prev, ev) {
  if (ev.type === "syncing") {
    return prev.map(m => (m.clientId === ev.clientMessageId || m.id === ev.clientMessageId) ? { ...m, status: "SYNCING" } : m);
  }
  if (ev.type === "retry") {
    return prev.map(m => (m.clientId === ev.clientMessageId || m.id === ev.clientMessageId) ? { ...m, status: "PENDING" } : m);
  }
  if (ev.type === "sent") {
    const srv = ev.serverMsg;
    if (srv) {
      const idx = prev.findIndex(m => m.clientId === ev.clientMessageId || m.id === ev.clientMessageId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...srv, clientId: ev.clientMessageId };
        return next;
      }
      return prev;
    }
    return prev.map(m => (m.clientId === ev.clientMessageId || m.id === ev.clientMessageId) ? { ...m, status: "SENT" } : m);
  }
  return prev;
}
