import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firebaseConfigured } from "../lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch {
      setError("Login failed — check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  if (!firebaseConfigured) {
    return (
      <section className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Admin not set up yet</h1>
        <p className="mt-3 text-muted">
          Firebase isn't configured for this site yet. Add your Firebase project's
          keys as environment variables — see README.md for the steps.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-md flex-col justify-center px-5 py-24">
      <h1 className="font-display text-4xl text-crimson">Admin Login</h1>
      <p className="mt-2 text-sm text-muted">You found the secret entrance.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-line bg-ink-soft px-4 py-3 text-sm outline-none focus:border-crimson"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-line bg-ink-soft px-4 py-3 text-sm outline-none focus:border-crimson"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-lg bg-crimson px-5 py-3 font-semibold text-ink transition hover:bg-crimson-glow disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
        {error && <div className="text-sm text-crimson-glow">{error}</div>}
      </form>
    </section>
  );
}
