const DB_NAME = "pingme_offline";
const DB_VERSION = 2;
const OUTBOX = "outbox";
const HISTORY_CACHE = "history_cache";

function getCurrentOwnerId() {
  try {
    const raw = localStorage.getItem("userId");
    if (raw && raw !== "null" && raw !== "undefined") {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const u = JSON.parse(userRaw);
      if (u?.id != null) return Number(u.id);
    }
  } catch {}
  return null;
}

export function makeCacheKey(ownerId, friendId) {
  return `${ownerId}:${friendId}`;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      const tx = req.transaction;
      const oldVersion = event.oldVersion;

      // OUTBOX store
      if (!db.objectStoreNames.contains(OUTBOX)) {
        const outbox = db.createObjectStore(OUTBOX, { keyPath: "clientMessageId" });
        outbox.createIndex("conversationId", "conversationId", { unique: false });
        outbox.createIndex("createdAt", "createdAt", { unique: false });
        outbox.createIndex("status", "status", { unique: false });
        outbox.createIndex("ownerId", "ownerId", { unique: false });
      } else {
        // Existing store — ensure ownerId index exists
        const outbox = tx.objectStore(OUTBOX);
        if (!outbox.indexNames.contains("ownerId")) {
          outbox.createIndex("ownerId", "ownerId", { unique: false });
        }
        // conversationId index already exists in v1; keep it
        if (!outbox.indexNames.contains("conversationId")) {
          outbox.createIndex("conversationId", "conversationId", { unique: false });
        }
        if (!outbox.indexNames.contains("createdAt")) {
          outbox.createIndex("createdAt", "createdAt", { unique: false });
        }
        if (!outbox.indexNames.contains("status")) {
          outbox.createIndex("status", "status", { unique: false });
        }
      }

      // HISTORY_CACHE store — v2 changes keyPath to cacheKey for per-user isolation
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains(HISTORY_CACHE)) {
          db.deleteObjectStore(HISTORY_CACHE);
        }
        const history = db.createObjectStore(HISTORY_CACHE, { keyPath: "cacheKey" });
        history.createIndex("ownerId", "ownerId", { unique: false });
        history.createIndex("friendId", "friendId", { unique: false });
      } else if (!db.objectStoreNames.contains(HISTORY_CACHE)) {
        const history = db.createObjectStore(HISTORY_CACHE, { keyPath: "cacheKey" });
        history.createIndex("ownerId", "ownerId", { unique: false });
        history.createIndex("friendId", "friendId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => console.warn("IndexedDB upgrade blocked");
  });
}

function withStore(storeName, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;
    try { result = fn(store); } catch (e) { reject(e); return; }
    if (result && typeof result.then === "function") {
      result.then(resolve).catch(reject);
      tx.onerror = () => reject(tx.error);
    } else if (result && "onsuccess" in result) {
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    } else {
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    }
  }));
}

// Internal helper to run arbitrary DB operation
function withDB(fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    try {
      const result = fn(db);
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
      } else if (result && "onsuccess" in result) {
        result.onsuccess = () => resolve(result.result);
        result.onerror = () => reject(result.error);
      } else {
        resolve(result);
      }
    } catch (e) { reject(e); }
  }));
}

// Outbox helpers — now strictly scoped by ownerId

export async function addPendingMessage(msg) {
  // Enforce ownerId: if caller omitted it, derive from storage (best effort) but warn
  if (msg.ownerId == null) {
    const derived = getCurrentOwnerId();
    if (derived != null) msg.ownerId = derived;
    else console.warn("addPendingMessage called without ownerId and no current userId available", msg);
  }
  // Ensure ownerId is numeric
  if (msg.ownerId != null) msg.ownerId = Number(msg.ownerId);
  return withStore(OUTBOX, "readwrite", store => store.put(msg));
}

export async function getAllPending() {
  return withStore(OUTBOX, "readonly", store => store.getAll());
}

export async function getAllPendingForOwner(ownerId) {
  if (ownerId == null) return [];
  ownerId = Number(ownerId);
  return withDB(db => new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX, "readonly");
    const store = tx.objectStore(OUTBOX);
    // Use index if available, fallback to full scan
    let req;
    try {
      const idx = store.index("ownerId");
      req = idx.getAll(ownerId);
    } catch {
      req = store.getAll();
    }
    req.onsuccess = () => {
      let data = req.result || [];
      // If index worked, data already filtered; if not, filter manually
      if (data.length && data[0].ownerId == null) {
        // No ownerId on old records — manually filter (will be empty after purge)
        data = data.filter(r => Number(r.ownerId) === ownerId);
      }
      resolve(data);
    };
    req.onerror = () => reject(req.error);
  }));
}

export async function getPendingByConversation(friendId) {
  // H1 SECURITY: strictly owner-scoped. Never return unfiltered data.
  // Legacy single-arg is retained only for callers that already enforce owner via getCurrentOwnerId.
  const ownerId = getCurrentOwnerId();
  if (ownerId == null) {
    console.warn("getPendingByConversation without authenticated owner — returning empty to prevent cross-account leak");
    return [];
  }
  return getPendingByConversationForOwner(ownerId, friendId);
}

export async function getPendingByConversationForOwner(ownerId, friendId) {
  if (ownerId == null) {
    console.warn("getPendingByConversationForOwner called without ownerId — returning empty");
    return [];
  }
  ownerId = Number(ownerId);
  friendId = Number(friendId);
  const allForOwner = await getAllPendingForOwner(ownerId);
  return allForOwner.filter(r => Number(r.conversationId) === friendId);
}

export async function removePending(clientMessageId) {
  return withStore(OUTBOX, "readwrite", store => store.delete(clientMessageId));
}

export async function getPending(clientMessageId) {
  return withStore(OUTBOX, "readonly", store => store.get(clientMessageId));
}

export async function updatePending(clientMessageId, patch) {
  const existing = await getPending(clientMessageId);
  if (!existing) return;
  const updated = { ...existing, ...patch };
  // Preserve ownerId
  if (updated.ownerId != null) updated.ownerId = Number(updated.ownerId);
  await addPendingMessage(updated);
  return updated;
}

export async function clearOutbox() {
  return withStore(OUTBOX, "readwrite", store => store.clear());
}

export async function clearOutboxForOwner(ownerId) {
  if (ownerId == null) return;
  ownerId = Number(ownerId);
  const pending = await getAllPendingForOwner(ownerId);
  if (!pending.length) return;
  return withDB(db => new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX, "readwrite");
    const store = tx.objectStore(OUTBOX);
    let remaining = pending.length;
    let hadError = null;
    pending.forEach(r => {
      const req = store.delete(r.clientMessageId);
      req.onerror = () => { hadError = req.error; };
      req.onsuccess = () => {
        remaining--;
        if (remaining === 0) {
          if (hadError) reject(hadError);
          else resolve();
        }
      };
    });
    tx.onerror = () => reject(tx.error);
  }));
}

// Purge orphan records that have no ownerId (pre-fix data) — prevents cross-account leakage
export async function purgeOrphanedOutbox() {
  const all = await getAllPending();
  const orphans = all.filter(r => r.ownerId == null);
  if (!orphans.length) return 0;
  await withDB(db => new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX, "readwrite");
    const store = tx.objectStore(OUTBOX);
    orphans.forEach(r => {
      store.delete(r.clientMessageId);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
  return orphans.length;
}

// History cache helpers — store conversation messages blob per user
export async function setHistoryCache(friendId, data) {
  const ownerId = getCurrentOwnerId();
  if (ownerId == null) {
    console.warn("setHistoryCache without ownerId — no authenticated user, skipping cache to prevent leak");
    return;
  }
  return setHistoryCacheForOwner(ownerId, friendId, data);
}

// New explicit per-owner API — preferred
export async function setHistoryCacheForOwner(ownerId, friendId, data) {
  if (ownerId == null || friendId == null) throw new Error("ownerId and friendId required");
  const cacheKey = makeCacheKey(Number(ownerId), Number(friendId));
  return withStore(HISTORY_CACHE, "readwrite", store => store.put({ cacheKey, ownerId: Number(ownerId), friendId: Number(friendId), ...data, cachedAt: Date.now() }));
}

export async function getHistoryCache(friendId) {
  // H1 SECURITY: strictly owner-scoped. Never return unfiltered cache.
  const ownerId = getCurrentOwnerId();
  if (ownerId != null) {
    return getHistoryCacheForOwner(ownerId, friendId);
  }
  console.warn("getHistoryCache without authenticated owner — returning undefined to prevent cross-account leak");
  return undefined;
}

export async function getHistoryCacheForOwner(ownerId, friendId) {
  if (ownerId == null || friendId == null) return undefined;
  const cacheKey = makeCacheKey(Number(ownerId), Number(friendId));
  return withStore(HISTORY_CACHE, "readonly", store => store.get(cacheKey));
}

export async function getAllHistoryCache() {
  return withStore(HISTORY_CACHE, "readonly", store => store.getAll());
}

export async function getAllHistoryCacheForOwner(ownerId) {
  if (ownerId == null) return [];
  ownerId = Number(ownerId);
  return withDB(db => new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_CACHE, "readonly");
    const store = tx.objectStore(HISTORY_CACHE);
    try {
      const idx = store.index("ownerId");
      const req = idx.getAll(ownerId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    } catch {
      // Fallback: scan all and filter
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result || [];
        resolve(all.filter(r => Number(r.ownerId) === ownerId || r.cacheKey?.startsWith(`${ownerId}:`)));
      };
      req.onerror = () => reject(req.error);
    }
  }));
}

export async function removeHistoryCache(friendId) {
  const ownerId = getCurrentOwnerId();
  if (ownerId != null) return removeHistoryCacheForOwner(ownerId, friendId);
  console.warn("removeHistoryCache without authenticated owner — no-op to prevent cross-account leak");
  return;
}

export async function removeHistoryCacheForOwner(ownerId, friendId) {
  const cacheKey = makeCacheKey(Number(ownerId), Number(friendId));
  return withStore(HISTORY_CACHE, "readwrite", store => store.delete(cacheKey));
}

export async function clearHistoryCacheForOwner(ownerId) {
  if (ownerId == null) return;
  const all = await getAllHistoryCacheForOwner(ownerId);
  if (!all.length) return;
  return withDB(db => new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_CACHE, "readwrite");
    const store = tx.objectStore(HISTORY_CACHE);
    all.forEach(r => store.delete(r.cacheKey));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
}

// Utility to purge any pre-fix global cache entries that lack proper cacheKey/ownerId
export async function purgeOrphanedHistoryCache() {
  const all = await getAllHistoryCache();
  // Orphan = missing cacheKey or missing ownerId
  const orphans = all.filter(r => !r.cacheKey || r.ownerId == null);
  if (!orphans.length) return 0;
  await withDB(db => new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_CACHE, "readwrite");
    const store = tx.objectStore(HISTORY_CACHE);
    orphans.forEach(r => {
      // Try both keys
      if (r.cacheKey) store.delete(r.cacheKey);
      if (r.friendId != null && !r.cacheKey) store.delete(r.friendId);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
  return orphans.length;
}

export async function purgeOrphanedData() {
  const a = await purgeOrphanedOutbox();
  const b = await purgeOrphanedHistoryCache();
  return { outbox: a, history: b };
}
