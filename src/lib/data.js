import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const WORK_COLLECTION = "work";
const SETTINGS_DOC = "settings/site";

export const DEFAULT_SETTINGS = {
  name: "Zaudin",
  heroTagline: ["Frontend Developer", "Fast UI builder", "Event Manager"],
  heroSub: "Frontend Developer • Event Manager • Fast AI-powered builder",
  aboutTitle: "My Advantage",
  aboutSub:
    "A blend of hands-on experience in design, frontend development, event execution, and AI-powered productivity — giving me an unfair edge in modern projects.",
  yearsExperience: 2,
  profileImage: "",
  coverImage: "",
  contactName: "Zaudin",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  contactHeroTitle: "Let's build something great",
  contactHeroSub: "Reach out to discuss projects, collabs or just say hi.",
  formspreeUrl: "",
  resumeUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  experienceItems: [], // [{ role, org, period, description }]
  themes: [], // [{ name, bg, card, line, accent, accentGlow, text, muted }]
  skills: [], // [{ label, value }] — the percentage cards on the home page
  yearsLabel: "Years of Experience",
  satisfactionBadge: "100% Client Satisfaction",
};

/** Live-subscribes to the work (projects + games) collection, newest first. */
export function subscribeWork(callback) {
  const q = query(collection(db, WORK_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function addWorkItem(item) {
  return addDoc(collection(db, WORK_COLLECTION), {
    ...item,
    createdAt: serverTimestamp(),
  });
}

export async function updateWorkItem(id, item) {
  return updateDoc(doc(db, WORK_COLLECTION, id), item);
}

export async function deleteWorkItem(id) {
  return deleteDoc(doc(db, WORK_COLLECTION, id));
}

/** Live-subscribes to the single site-settings document. */
export function subscribeSettings(callback) {
  return onSnapshot(doc(db, SETTINGS_DOC), (snap) => {
    callback(snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS);
  });
}

export async function getSettingsOnce() {
  const snap = await getDoc(doc(db, SETTINGS_DOC));
  return snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS;
}

export async function saveSettings(partial) {
  return setDoc(doc(db, SETTINGS_DOC), partial, { merge: true });
}