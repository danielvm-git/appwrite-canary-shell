// story: e01s02
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AppFooter } from "../components/AppFooter";
import { Icon } from "../components/ui";
import { useSession } from "../hooks/useSession";
import { appwriteConfigured, createAccount, newId } from "../lib/appwrite";

type Mode = "signin" | "signup";

function friendly(err: unknown): string {
  const text = err instanceof Error ? err.message : "";
  if (/Invalid credentials/i.test(text)) return "Wrong email or password.";
  if (/already exists/i.test(text)) return "An account with this email already exists. Sign in instead.";
  if (/password/i.test(text) && /8/.test(text)) return "Use a password with at least 8 characters.";
  return text || "Something went wrong. Try again.";
}

export function SignInPage() {
  const { user, loading, refresh } = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/tasks" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const em = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(em)) {
      setError("Enter a valid email.");
      return;
    }
    if (!appwriteConfigured()) {
      setError("Appwrite is not configured for this build.");
      return;
    }
    setBusy(true);
    try {
      const account = createAccount();
      if (mode === "signup") {
        await account.create({ userId: newId(), email: em, password, name: name.trim() || undefined });
      }
      await account.createEmailPasswordSession({ email: em, password });
      await refresh();
      navigate("/tasks", { replace: true });
    } catch (err) {
      setError(friendly(err));
      setBusy(false);
    }
  }

  const signup = mode === "signup";

  return (
    <div className="auth-page">
      <div className="auth-center">
        <form className="card auth-card" onSubmit={onSubmit}>
          <div className="brand">
            <div className="brand-mark">
              <Icon name="check-square" />
            </div>
            <div className="brand-name">Tasks</div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{signup ? "Create an account" : "Sign in"}</div>
            <div className="muted">{signup ? "Plan, share and finish tasks with your team." : "Welcome back. Use your email and password."}</div>
          </div>
          {signup && (
            <input className="input" aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
          )}
          <input
            className="input"
            type="email"
            aria-label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <input
            className="input"
            type="password"
            aria-label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Password"
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={8}
            required
          />
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Continue"}
          </button>
          <div className="muted">
            {signup ? "Already have an account? " : "New here? "}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setMode(signup ? "signin" : "signup");
                setError("");
              }}
            >
              {signup ? "Sign in" : "Create an account"}
            </button>
          </div>
        </form>
      </div>
      <AppFooter testId="landing-app-footer" />
    </div>
  );
}
