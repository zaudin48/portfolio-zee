import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  addWorkItem,
  updateWorkItem,
  deleteWorkItem,
  saveSettings,
  DEFAULT_SETTINGS,
} from "../lib/data";

const emptyForm = { title: "", description: "", link: "", image: "", category: "project" };

export default function AdminPanel({ settings, work }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [settingsForm, setSettingsForm] = useState(settings || DEFAULT_SETTINGS);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    setSettingsForm(settings || DEFAULT_SETTINGS);
  }, [settings]);

  async function handleWorkSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await updateWorkItem(editingId, form);
      setEditingId(null);
    } else {
      await addWorkItem(form);
    }
    setForm(emptyForm);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      link: item.link || "",
      image: item.image || "",
      category: item.category || "project",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (confirm("Delete this item?")) {
      await deleteWorkItem(id);
    }
  }

  async function handleSettingsSubmit(e) {
    e.preventDefault();
    await saveSettings({
      ...settingsForm,
      heroTagline: settingsForm.heroTagline
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      yearsExperience: Number(settingsForm.yearsExperience) || 0,
    });
    setSavedMsg("Saved!");
    setTimeout(() => setSavedMsg(""), 2500);
  }

  const inputClass =
    "rounded-lg border border-line bg-ink-soft px-4 py-3 text-sm outline-none focus:border-crimson w-full";

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl sm:text-4xl">
          Admin <span className="text-crimson">Dashboard</span>
        </h1>
        <button
          onClick={() => signOut(auth)}
          className="w-fit rounded-lg border border-line px-4 py-2 text-sm text-muted hover:border-crimson hover:text-web"
        >
          Log out
        </button>
      </div>

      {/* ---------------- WORK ITEMS ---------------- */}
      <div className="mt-10 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-2xl text-crimson">
          {editingId ? "Edit item" : "Add a project or game"}
        </h2>
        <form onSubmit={handleWorkSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="project">Project</option>
            <option value="game">Game</option>
          </select>
          <input
            className={`${inputClass} sm:col-span-2`}
            placeholder="Link (https://...)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <input
            className={`${inputClass} sm:col-span-2`}
            placeholder="Image URL (optional — paste a link, no upload needed)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <textarea
            className={`${inputClass} sm:col-span-2`}
            placeholder="Short description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-crimson px-5 py-3 font-semibold text-ink hover:bg-crimson-glow"
            >
              {editingId ? "Save changes" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg border border-line px-5 py-3 text-muted hover:text-web"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 space-y-3">
        {work.length === 0 && <p className="text-muted">No projects or games added yet.</p>}
        {work.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          >
            <div className="min-w-0 wrap-break-word">
              <span className="mr-2 rounded-full bg-crimson/15 px-2 py-0.5 font-mono text-xs uppercase text-crimson">
                {item.category}
              </span>
              <span className="font-semibold">{item.title}</span>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 break-all text-xs text-muted hover:text-crimson"
                >
                  ({item.link})
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(item)}
                className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-crimson hover:text-crimson"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:border-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- SITE SETTINGS ---------------- */}
      <div className="mt-14 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-2xl text-crimson">Site Settings</h2>
        <p className="mt-1 text-sm text-muted">
          Everything here updates the live site instantly — no rebuild, no GitHub push.
        </p>

        <form onSubmit={handleSettingsSubmit} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
            Your name (shown in the hero)
            <input
              className={inputClass}
              value={settingsForm.name || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
            Typing taglines (comma-separated)
            <input
              className={inputClass}
              value={
                Array.isArray(settingsForm.heroTagline)
                  ? settingsForm.heroTagline.join(", ")
                  : settingsForm.heroTagline || ""
              }
              onChange={(e) => setSettingsForm({ ...settingsForm, heroTagline: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
            Short line under the tagline
            <input
              className={inputClass}
              value={settingsForm.heroSub || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroSub: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Profile photo URL
            <input
              className={inputClass}
              value={settingsForm.profileImage || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, profileImage: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Cover banner URL
            <input
              className={inputClass}
              value={settingsForm.coverImage || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, coverImage: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Years of experience
            <input
              type="number"
              className={inputClass}
              value={settingsForm.yearsExperience ?? 0}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, yearsExperience: e.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Years-of-experience label text
            <input
              className={inputClass}
              placeholder="Years of Experience"
              value={settingsForm.yearsLabel || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, yearsLabel: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Satisfaction badge text
            <input
              className={inputClass}
              placeholder="100% Client Satisfaction"
              value={settingsForm.satisfactionBadge || ""}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, satisfactionBadge: e.target.value })
              }
            />
          </label>

          <div className="sm:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted">Skill percentage cards</span>
              <button
                type="button"
                onClick={() =>
                  setSettingsForm({
                    ...settingsForm,
                    skills: [...(settingsForm.skills || []), { label: "", value: 80 }],
                  })
                }
                className="rounded-lg border border-line px-3 py-1.5 text-xs hover:border-crimson hover:text-crimson"
              >
                + Add skill
              </button>
            </div>
            <p className="mb-3 text-xs text-muted">
              If this list is empty, the site shows its original default set.
            </p>
            <div className="space-y-2">
              {(settingsForm.skills || []).map((skill, i) => {
                function updateSkill(field, value) {
                  const next = [...settingsForm.skills];
                  next[i] = { ...next[i], [field]: value };
                  setSettingsForm({ ...settingsForm, skills: next });
                }
                function removeSkill() {
                  setSettingsForm({
                    ...settingsForm,
                    skills: settingsForm.skills.filter((_, idx) => idx !== i),
                  });
                }
                return (
                  <div key={i} className="flex gap-2">
                    <input
                      className={`${inputClass} flex-1 min-w-0`}
                      placeholder="Label (e.g. Frontend)"
                      value={skill.label}
                      onChange={(e) => updateSkill("label", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={`${inputClass} w-24 shrink-0`}
                      placeholder="%"
                      value={skill.value}
                      onChange={(e) => updateSkill("value", Number(e.target.value))}
                    />
                    <button
                      type="button"
                      onClick={removeSkill}
                      className="shrink-0 rounded-lg border border-line px-3 text-xs text-muted hover:border-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              {(settingsForm.skills || []).length === 0 && (
                <p className="text-xs text-muted">No custom skills yet — add your first one above.</p>
              )}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Formspree URL (contact form)
            <input
              className={inputClass}
              placeholder="https://formspree.io/f/xxxx"
              value={settingsForm.formspreeUrl || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, formspreeUrl: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Resume/CV URL (a PDF link — Google Drive, Dropbox, etc.)
            <input
              className={inputClass}
              placeholder="https://..."
              value={settingsForm.resumeUrl || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, resumeUrl: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            LinkedIn URL
            <input
              className={inputClass}
              placeholder="https://linkedin.com/in/..."
              value={settingsForm.linkedinUrl || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, linkedinUrl: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Instagram URL
            <input
              className={inputClass}
              placeholder="https://instagram.com/..."
              value={settingsForm.instagramUrl || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
            />
          </label>

          <div className="web-divider sm:col-span-2 my-2" />

          <label className="flex flex-col gap-1 text-xs text-muted">
            Contact name
            <input
              className={inputClass}
              value={settingsForm.contactName || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, contactName: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Email
            <input
              className={inputClass}
              value={settingsForm.email || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Phone
            <input
              className={inputClass}
              value={settingsForm.phone || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            WhatsApp number
            <input
              className={inputClass}
              value={settingsForm.whatsapp || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
            Address
            <input
              className={inputClass}
              value={settingsForm.address || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
            Contact page title
            <input
              className={inputClass}
              value={settingsForm.contactHeroTitle || ""}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, contactHeroTitle: e.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
            Contact page subtitle
            <input
              className={inputClass}
              value={settingsForm.contactHeroSub || ""}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, contactHeroSub: e.target.value })
              }
            />
          </label>

          <div className="web-divider sm:col-span-2 my-2" />

          <div className="sm:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted">
                Themes (pulling the string on the homepage cycles through these)
              </span>
              <button
                type="button"
                onClick={() =>
                  setSettingsForm({
                    ...settingsForm,
                    themes: [
                      ...(settingsForm.themes || []),
                      {
                        name: "New Theme",
                        bg: "#0a0a0d",
                        card: "#191b22",
                        line: "#262a34",
                        accent: "#c8202b",
                        accentGlow: "#ff3b44",
                        text: "#eeece4",
                        muted: "#8b8f9a",
                      },
                    ],
                  })
                }
                className="rounded-lg border border-line px-3 py-1.5 text-xs hover:border-crimson hover:text-crimson"
              >
                + Add theme
              </button>
            </div>
            <p className="mb-3 text-xs text-muted">
              If this list is empty, the site just uses the default red/black look.
            </p>

            <div className="space-y-3">
              {(settingsForm.themes || []).map((theme, i) => {
                function updateTheme(field, value) {
                  const next = [...settingsForm.themes];
                  next[i] = { ...next[i], [field]: value };
                  setSettingsForm({ ...settingsForm, themes: next });
                }
                function removeTheme() {
                  const next = settingsForm.themes.filter((_, idx) => idx !== i);
                  setSettingsForm({ ...settingsForm, themes: next });
                }
                const swatches = [
                  ["bg", "Background"],
                  ["card", "Card"],
                  ["line", "Border"],
                  ["accent", "Accent"],
                  ["accentGlow", "Accent Glow"],
                  ["text", "Text"],
                  ["muted", "Muted"],
                ];
                return (
                  <div key={i} className="rounded-xl border border-line p-3">
                    <input
                      className={`${inputClass} mb-3`}
                      placeholder="Theme name"
                      value={theme.name}
                      onChange={(e) => updateTheme("name", e.target.value)}
                    />
                    <div className="flex flex-wrap gap-3">
                      {swatches.map(([field, label]) => (
                        <label key={field} className="flex flex-col items-center gap-1 text-[10px] text-muted">
                          {label}
                          <input
                            type="color"
                            value={theme[field] || "#000000"}
                            onChange={(e) => updateTheme(field, e.target.value)}
                            className="h-8 w-10 cursor-pointer rounded border border-line bg-transparent"
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={removeTheme}
                      className="mt-3 w-fit rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-red-500 hover:text-red-400"
                    >
                      Remove theme
                    </button>
                  </div>
                );
              })}
              {(settingsForm.themes || []).length === 0 && (
                <p className="text-xs text-muted">No custom themes yet — add your first one above.</p>
              )}
            </div>
          </div>

          <div className="web-divider sm:col-span-2 my-2" />

          <div className="sm:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted">Experience / CV timeline</span>
              <button
                type="button"
                onClick={() =>
                  setSettingsForm({
                    ...settingsForm,
                    experienceItems: [
                      ...(settingsForm.experienceItems || []),
                      { role: "", org: "", period: "", description: "" },
                    ],
                  })
                }
                className="rounded-lg border border-line px-3 py-1.5 text-xs hover:border-crimson hover:text-crimson"
              >
                + Add entry
              </button>
            </div>

            <div className="space-y-3">
              {(settingsForm.experienceItems || []).map((item, i) => {
                function updateItem(field, value) {
                  const next = [...settingsForm.experienceItems];
                  next[i] = { ...next[i], [field]: value };
                  setSettingsForm({ ...settingsForm, experienceItems: next });
                }
                function removeItem() {
                  const next = settingsForm.experienceItems.filter((_, idx) => idx !== i);
                  setSettingsForm({ ...settingsForm, experienceItems: next });
                }
                return (
                  <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-2">
                    <input
                      className={inputClass}
                      placeholder="Role (e.g. Frontend Developer)"
                      value={item.role}
                      onChange={(e) => updateItem("role", e.target.value)}
                    />
                    <input
                      className={inputClass}
                      placeholder="Company / Org"
                      value={item.org}
                      onChange={(e) => updateItem("org", e.target.value)}
                    />
                    <input
                      className={inputClass}
                      placeholder="Period (e.g. 2024 — Present)"
                      value={item.period}
                      onChange={(e) => updateItem("period", e.target.value)}
                    />
                    <input
                      className={inputClass}
                      placeholder="Short description"
                      value={item.description}
                      onChange={(e) => updateItem("description", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={removeItem}
                      className="w-fit rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-red-500 hover:text-red-400 sm:col-span-2"
                    >
                      Remove entry
                    </button>
                  </div>
                );
              })}
              {(settingsForm.experienceItems || []).length === 0 && (
                <p className="text-xs text-muted">No entries yet — add your first one above.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-crimson px-5 py-3 font-semibold text-ink hover:bg-crimson-glow"
            >
              Save settings
            </button>
            {savedMsg && <span className="text-sm text-crimson">{savedMsg}</span>}
          </div>
        </form>
      </div>
    </section>
  );
}