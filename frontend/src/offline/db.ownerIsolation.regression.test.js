/**
 * H1 Regression Test — Offline Pending Message Owner Isolation
 *
 * Test scenario: A enqueue → B read → B gets ZERO A records.
 *
 * Verifies every pending-message read is owner-scoped and never relies only on friendId.
 *
 * Manual verification (browser console):
 * 1. localStorage.setItem("userId","1"); localStorage.setItem("user", JSON.stringify({id:1}))
 * 2. await import("./db.js").then(m=>m.addPendingMessage({clientMessageId:"test-a-1", conversationId:99, ownerId:1, receiverId:99, content:"hello from A", createdAt:new Date().toISOString()}))
 * 3. localStorage.setItem("userId","2"); localStorage.setItem("user", JSON.stringify({id:2}))
 * 4. const pendingForB = await db.getPendingByConversation(99); console.assert(pendingForB.length===0, "B must see 0", pendingForB)
 * 5. const pendingForA = await db.getPendingByConversationForOwner(1,99); console.assert(pendingForA.length===1, "A has 1")
 * 6. const pendingForB2 = await db.getPendingByConversationForOwner(2,99); console.assert(pendingForB2.length===0, "B owner-scoped 0")
 * 7. Cleanup: localStorage.setItem("userId","1"); await db.removePending("test-a-1")
 *
 * Automated guard check (no IndexedDB needed):
 * Verify db.js contains owner-scoping guards that return empty when no owner.
 */

// Guard check — synchronous, safe to import in vite build but no side effects
export function validateOwnerIsolationGuards(sourceText) {
  if (!sourceText || typeof sourceText !== "string") return { passed: false };
  const checks = {
    getPendingByConversationGuard: sourceText.includes("getPendingByConversation without authenticated owner") && sourceText.includes("return []"),
    getPendingByConversationForOwnerGuard: sourceText.includes("getPendingByConversationForOwner called without ownerId"),
    getHistoryCacheGuard: sourceText.includes("getHistoryCache without authenticated owner"),
    removeHistoryCacheGuard: sourceText.includes("removeHistoryCache without authenticated owner"),
  };
  return { ...checks, passed: Object.values(checks).every(Boolean) };
}

// Node direct-run: node frontend/src/offline/db.ownerIsolation.regression.test.js
if (typeof process !== "undefined" && process.argv[1] && process.argv[1].endsWith("db.ownerIsolation.regression.test.js")) {
  try {
    const fs = await import("fs");
    const url = new URL("./db.js", import.meta.url);
    const src = fs.readFileSync(url, "utf8");
    const result = validateOwnerIsolationGuards(src);
    console.log("H1 regression: verifying owner isolation guards in db.js...");
    for (const [k,v] of Object.entries(result)) {
      if (k==="passed") continue;
      console.log(`  ${v ? "✓" : "✗"} ${k}`);
    }
    console.log(result.passed ? "\nH1 PASSED: all owner isolation guards present." : "\nH1 FAILED: missing guards");
    process.exit(result.passed ? 0 : 1);
  } catch (e) {
    console.error("H1 regression check failed:", e);
    process.exit(1);
  }
}
