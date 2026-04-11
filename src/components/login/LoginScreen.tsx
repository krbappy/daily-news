import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { useAppStore } from "../../store/useAppStore";

export default function LoginScreen() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const setOtherUser = useAppStore((s) => s.setOtherUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const { token, passwordType, user, otherUser } = await login(
        username,
        password
      );

      sessionStorage.setItem("session_token", token);
      sessionStorage.setItem("session_user", JSON.stringify(user));

      setAuth(token, user, passwordType);
      if (otherUser) setOtherUser(otherUser);

      navigate(passwordType === "A" ? "/chat" : "/private", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-ink-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #5b21b6, transparent)" }}
      />

      <div
        className={`relative w-full max-w-sm bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl ${
          shake ? "animate-shake" : ""
        }`}
      >
        <h1 className="text-2xl font-semibold text-white text-center mb-1 tracking-tight">
          Messenger
        </h1>
        <p className="text-sm text-zinc-500 text-center mb-8">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-br from-accent-bright to-accent-deep text-white font-semibold rounded-2xl py-2.5 shadow-lg shadow-accent/30 hover:shadow-accent/50 transition disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
