import {
  doc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const SESSION_KEY = "zaudin-visitor-session";
const VISITORS_COLLECTION = "visitors";

// Approximate location via a free IP-geolocation lookup — no permission
// popup involved (this is just a normal network request, not the
// browser's GPS/geolocation API). Trade-off worth knowing: this works by
// resolving the visitor's IP address through a third party, even though
// we only keep the city/country it resolves to, never the IP itself.
async function lookupApproxLocation() {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (!data || data.success === false) return null;
    return {
      city: data.city || "",
      region: data.region || "",
      country: data.country || "",
    };
  } catch {
    return null;
  }
}

export function getOrCreateSessionId() {
  let id = window.localStorage.getItem(SESSION_KEY);
  let isNew = false;
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, id);
    isNew = true;
  }
  return { id, isNew };
}

// Creates the visitor doc on first-ever visit from this browser. Never
// touches firstVisit on subsequent visits, so it stays accurate.
export async function initVisitor({ sessionId, deviceInfo, referrer, email }) {
  if (!db) return;
  const ref = doc(db, VISITORS_COLLECTION, sessionId);
  const location = await lookupApproxLocation();
  await setDoc(
    ref,
    {
      sessionId,
      email: email || "",
      deviceType: deviceInfo.deviceType,
      osType: deviceInfo.osType,
      browser: deviceInfo.browser,
      brand: deviceInfo.brand || "",
      screenSize: deviceInfo.screenSize,
      city: location?.city || "",
      region: location?.region || "",
      country: location?.country || "",
      referrer: referrer || "direct",
      pageVisits: [],
      totalTimeSpent: 0,
      clicks: 0,
      firstVisit: serverTimestamp(),
      lastActive: serverTimestamp(),
    },
    { merge: true }
  );
}

// Records a new page visit (called on every route change).
export async function recordPageVisit(sessionId, path) {
  if (!db) return;
  const ref = doc(db, VISITORS_COLLECTION, sessionId);
  await updateDoc(ref, {
    pageVisits: arrayUnion({ path, enteredAt: Timestamp.now() }),
    lastActive: serverTimestamp(),
  }).catch(() => {
    // doc might not exist yet on a very first, very fast navigation — ignore
  });
}

// Batched heartbeat: bundles accumulated time + clicks into ONE write,
// instead of writing on every single click or every second.
export async function flushHeartbeat(sessionId, { secondsSpent, clickCount }) {
  if (!db) return;
  if (secondsSpent <= 0 && clickCount <= 0) return;
  const ref = doc(db, VISITORS_COLLECTION, sessionId);
  await updateDoc(ref, {
    totalTimeSpent: increment(secondsSpent),
    clicks: increment(clickCount),
    lastActive: serverTimestamp(),
  }).catch(() => {});
}

// ---- dashboard reads ----

export function subscribeRecentVisitors(callback, count = 10) {
  const q = query(collection(db, VISITORS_COLLECTION), orderBy("lastActive", "desc"), limit(count));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function fetchAllVisitors() {
  const snap = await getDocs(collection(db, VISITORS_COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Deletes visitor docs whose lastActive is older than `days` days.
// Manual trigger only (admin button) — true scheduled auto-deletion
// needs Cloud Functions, which requires the paid Blaze plan.
export async function cleanupOldVisitors(days = 90) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const all = await fetchAllVisitors();
  const stale = all.filter((v) => {
    const t = v.lastActive?.toMillis ? v.lastActive.toMillis() : 0;
    return t && t < cutoff;
  });
  await Promise.all(stale.map((v) => deleteDoc(doc(db, VISITORS_COLLECTION, v.id))));
  return stale.length;
}