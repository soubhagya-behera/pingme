import * as db from "./db";
import ChatService from "../services/ChatService";

let syncing = false;
let listeners = new Set();

function getCurrentOwnerId() {
  try {
    const raw = localStorage.getItem("userId");
    if (raw && raw !== "null" && raw !== "undefined") {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const u = JSON.parse(userRaw);
      if (u?.id != null) return Number(u.id);
    }
  } catch {}
  return null;
}

function notify(event) {
  listeners.forEach(cb => cb(event));
}

export function onSyncEvent(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Monotonic sequence to break ties when multiple messages share same millisecond timestamp
let seqCounter = Date.now() % 1000000;
function nextSeq() { seqCounter = (seqCounter + 1) % Number.MAX_SAFE_INTEGER; return seqCounter; }

// Queue a message locally; returns the stored record — strictly scoped to current user
export async function enqueueMessage({ clientMessageId, conversationId, senderId, receiverId, content, messageType = "TEXT", replyToId = null, attachmentUrl = null, attachmentName = null, attachmentSize = null, attachmentMimeType = null, attachmentDuration = null, createdAt, ownerId }) {
  const effectiveOwnerId = ownerId != null ? Number(ownerId) : getCurrentOwnerId();
  if (effectiveOwnerId == null) {
    console.warn("enqueueMessage without ownerId — aborting to prevent cross-account leak");
    throw new Error("Cannot enqueue offline message without authenticated user");
  }
  const record = {
    clientMessageId,
    conversationId,
    ownerId: effectiveOwnerId,
    senderId,
    receiverId,
    content: content ?? "",
    messageType,
    replyToId,
    attachmentUrl,
    attachmentName,
    attachmentSize,
    attachmentMimeType,
    attachmentDuration,
    createdAt: createdAt || new Date().toISOString(),
    seq: nextSeq(),
    status: "PENDING",
    attempts: 0,
  };
  await db.addPendingMessage(record);
  notify({ type: "enqueued", record });
  return record;
}

// Called when online detected; sequential sync preserving createdAt order — only current user's outbox
export async function syncPendingMessages() {
  if (syncing) return { synced: 0, failed: 0 };
  if (typeof navigator !== "undefined" && !navigator.onLine) return { synced: 0, failed: 0 };
  const ownerId = getCurrentOwnerId();
  if (ownerId == null) return { synced: 0, failed: 0 };
  // Proactively purge orphaned pre-fix data that could leak
  try { await db.purgeOrphanedData(); } catch {}
  syncing = true;
  notify({ type: "sync-start" });
  let synced = 0;
  let failed = 0;
  try {
    let all = await db.getAllPendingForOwner(ownerId);
    if (!all || all.length === 0) {
      syncing = false;
      notify({ type: "sync-end", synced, failed });
      return { synced, failed };
    }
    // Only retry PENDING/SYNCING, leave FAILED for manual inspection
    all = all.filter(m => m.status === "PENDING" || m.status === "SYNCING" || m.status == null);
    if (all.length === 0) {
      syncing = false;
      notify({ type: "sync-end", synced, failed });
      return { synced, failed };
    }
    all.sort((a, b) => {
      const d = new Date(a.createdAt) - new Date(b.createdAt);
      if (d !== 0) return d;
      return (a.seq || 0) - (b.seq || 0);
    });
    for (const pending of all) {
      try {
        await db.updatePending(pending.clientMessageId, { status: "SYNCING", attempts: (pending.attempts || 0) + 1 });
        notify({ type: "syncing", clientMessageId: pending.clientMessageId });
        const payload = {
          clientId: pending.clientMessageId,
          receiverId: pending.receiverId,
          content: pending.content,
          messageType: pending.messageType,
          replyToId: pending.replyToId,
          attachmentUrl: pending.attachmentUrl,
          attachmentName: pending.attachmentName,
          attachmentSize: pending.attachmentSize,
          attachmentMimeType: pending.attachmentMimeType,
          attachmentDuration: pending.attachmentDuration,
        };
        // Use REST sync endpoint (idempotent)
        const resp = await ChatService.syncMessage(payload);
        const serverMsg = resp?.data?.data ?? resp?.data ?? null;
        // Remove from outbox on success (or if duplicate handled)
        await db.removePending(pending.clientMessageId);
        notify({ type: "sent", clientMessageId: pending.clientMessageId, serverMsg });
        synced++;
      } catch (err) {
        // Network/auth error: keep PENDING for retry; validation errors: mark FAILED
        const isRetryable = !err.response || err.response.status >= 500 || err.response.status === 401 || err.response.status === 403 || err.code === "ERR_NETWORK";
        if (isRetryable) {
          await db.updatePending(pending.clientMessageId, { status: "PENDING" });
        } else {
          // For validation errors (400 etc.), don't infinite retry - mark as failed but keep for inspection
          await db.updatePending(pending.clientMessageId, { status: "FAILED" });
        }
        failed++;
        // If offline, stop and retry later. Use navigator.onLine directly (smallest
        // safe fix: the previous code referenced an undefined isNetwork variable,
        // which threw ReferenceError and aborted queue processing incorrectly).
        if (typeof navigator !== "undefined" && !navigator.onLine) break;
        console.error("sync pending failed", err);
      }
    }
  } finally {
    syncing = false;
    notify({ type: "sync-end", synced, failed });
  }
  return { synced, failed };
}

export function isSyncing() { return syncing; }

export async function removePendingAndNotify(clientMessageId, serverMsg) {
  await db.removePending(clientMessageId);
  notify({ type: "sent", clientMessageId, serverMsg });
}
