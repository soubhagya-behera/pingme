import * as db from "./db";
import ChatService from "../services/ChatService";

let syncing = false;
let listeners = new Set();

// B-O2/O7: consecutive fully-failed passes (network/5xx) back off so a
// flapping device or struggling backend is not hammered every 15s.
let backoffUntil = 0;
let consecutiveFailedPasses = 0;
const BASE_BACKOFF_MS = 15000;
const MAX_BACKOFF_MS = 2 * 60 * 1000;

// B-O7: bounded per-message attempts. Rows carry attempts/lastError/failedAt
// as schemaless patches — no IndexedDB migration, no schema change.
const MAX_ATTEMPTS = 10;

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
  // B-O2: honour the backoff window after consecutive fully-failed passes.
  if (Date.now() < backoffUntil) return { synced: 0, failed: 0, backedOff: true };
  const ownerId = getCurrentOwnerId();
  if (ownerId == null) return { synced: 0, failed: 0 };
  const epochOwner = ownerId;
  // Proactively purge orphaned pre-fix data that could leak
  try { await db.purgeOrphanedData(); } catch {}
  syncing = true;
  notify({ type: "sync-start" });
  let synced = 0;
  let failed = 0;
  try {
    // B-O4: SYNCING is durable — a refresh/tab-close mid-drain leaves it
    // behind. Heal it to PENDING at drain start so it is never stuck.
    try {
      const stale = await db.getAllPendingForOwner(epochOwner);
      for (const row of stale || []) {
        if (row.status === "SYNCING") {
          await db.updatePending(row.clientMessageId, { status: "PENDING" });
        }
      }
    } catch {}
    // B-O2/O9: drain until empty (bounded) so messages enqueued mid-pass are
    // not stranded for up to 15s; reseed the tie-break sequence from the max
    // durable seq so per-load counter resets cannot invert ordering.
    for (let pass = 0; pass < 3; pass++) {
      // B-O3: abort the pass (leaving rows PENDING) when the account changed
      // mid-drain — logout/switch must never convert the previous user's
      // in-flight messages into FAILED.
      if (getCurrentOwnerId() == null || Number(getCurrentOwnerId()) !== Number(epochOwner)) break;
      let all = await db.getAllPendingForOwner(epochOwner);
      if (!all || all.length === 0) break;
      // Only retry PENDING/SYNCING, leave FAILED for manual retry via the "!" affordance
      all = all.filter(m => m.status === "PENDING" || m.status === "SYNCING" || m.status == null);
      if (all.length === 0) break;
      // B-O9: reseed from the durable max so the sort below is stable.
      try {
        let maxSeq = 0;
        for (const m of all) {
          if (typeof m.seq === "number" && m.seq > maxSeq) maxSeq = m.seq;
          else if (m.seq == null) { const s = nextSeq(); maxSeq = Math.max(maxSeq, s); await db.updatePending(m.clientMessageId, { seq: s }); }
        }
        if (maxSeq > seqCounter) seqCounter = maxSeq;
      } catch {}
      all.sort((a, b) => {
        const d = new Date(a.createdAt) - new Date(b.createdAt);
        if (d !== 0) return d;
        return (a.seq || 0) - (b.seq || 0);
      });
    for (const pending of all) {
      // B-O2: check connectivity between messages, not just after failures,
      // so a mid-pass dropout stops the pass instead of failing each row.
      if (typeof navigator !== "undefined" && !navigator.onLine) break;
      // B-O3: stop immediately on account change; rows stay PENDING.
      if (getCurrentOwnerId() == null || Number(getCurrentOwnerId()) !== Number(epochOwner)) break;
      // B-O7: poison guard — a row that already exhausted attempts stays FAILED.
      if ((pending.attempts || 0) >= MAX_ATTEMPTS && pending.status === "PENDING") {
        await db.updatePending(pending.clientMessageId, { status: "FAILED", lastError: "retry-limit", failedAt: new Date().toISOString() });
        failed++;
        continue;
      }
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
        // F-OF02: 401/403 are permanent auth failures — mark FAILED, do NOT retry forever.
        // B-O3: but only when the same account is still signed in; after a
        // logout/switch the rows belong to the previous user and stay PENDING.
        const status = err.response?.status;
        const ownerChanged = getCurrentOwnerId() == null || Number(getCurrentOwnerId()) !== Number(epochOwner);
        if (ownerChanged) {
          try { await db.updatePending(pending.clientMessageId, { status: "PENDING" }); } catch {}
          break;
        }
        if (status === 401 || status === 403) {
          await db.updatePending(pending.clientMessageId, { status: "FAILED", lastError: `auth-${status}`, failedAt: new Date().toISOString() });
        } else {
          // B-O7: 429 (rate limit) is transient — requeue like network/5xx.
          const isRetryable = !err.response || err.response.status >= 500 || err.response.status === 429 || err.code === "ERR_NETWORK";
          if (isRetryable) {
            await db.updatePending(pending.clientMessageId, { status: "PENDING" });
          } else {
            // For validation errors (400 etc.), don't infinite retry - mark as failed but keep for inspection
            await db.updatePending(pending.clientMessageId, { status: "FAILED", lastError: `http-${status ?? "unknown"}`, failedAt: new Date().toISOString() });
          }
        }
        failed++;
        // If offline, stop and retry later. Use navigator.onLine directly (smallest
        // safe fix: the previous code referenced an undefined isNetwork variable,
        // which threw ReferenceError and aborted queue processing incorrectly).
        if (typeof navigator !== "undefined" && !navigator.onLine) break;
        console.error("sync pending failed", err);
      }
    }
    }
  } finally {
    syncing = false;
    // B-O2: back off after consecutive fully-failed passes; reset on progress.
    try {
      if (synced > 0) {
        consecutiveFailedPasses = 0;
        backoffUntil = 0;
      } else if (failed > 0) {
        consecutiveFailedPasses++;
        const wait = Math.min(BASE_BACKOFF_MS * Math.pow(2, consecutiveFailedPasses - 1), MAX_BACKOFF_MS);
        backoffUntil = Date.now() + wait;
      } else {
        consecutiveFailedPasses = 0;
        backoffUntil = 0;
      }
    } catch {}
    notify({ type: "sync-end", synced, failed });
  }
  return { synced, failed };
}

export function isSyncing() { return syncing; }

// B-O1: subtle retry affordance for terminal FAILED rows — requeue as
// PENDING (preserving the original authored order) and drain immediately.
// Called from the existing "!" indicator; no new UI, no visual change.
export async function retryFailedMessage(clientMessageId) {
  const ownerId = getCurrentOwnerId();
  if (ownerId == null || clientMessageId == null) return null;
  const existing = await db.getPending(clientMessageId).catch(() => null);
  if (!existing || Number(existing.ownerId) !== Number(ownerId)) return null;
  await db.updatePending(clientMessageId, {
    status: "PENDING",
    attempts: 0,
    lastError: null,
    failedAt: null,
  });
  notify({ type: "retry", clientMessageId });
  return syncPendingMessages();
}

export async function removePendingAndNotify(clientMessageId, serverMsg) {
  await db.removePending(clientMessageId);
  notify({ type: "sent", clientMessageId, serverMsg });
}
