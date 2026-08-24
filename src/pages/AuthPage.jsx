import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-chili-400">
        {mode === "login" ? "welcome back" : "set up your stall"}
      </p>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-paper-50">
        {mode === "login" ? "Log in" : "Create a vendor account"}
      </h1>
      <p className="mt-2 text-sm text-dusk-200">
        This app is for street food vendors managing their own stall on StreetEat.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "register" && (
          <Field label="Your name">
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="input" placeholder="Your name" />
          </Field>
        )}

        <Field label="Email">
          <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" placeholder="you@example.com" />
        </Field>

        {mode === "register" && (
          <Field label="Phone (optional)">
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" placeholder="9876500000" />
          </Field>
        )}

        <Field label="Password">
          <input required type="password" minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} className="input" placeholder="At least 8 characters" />
        </Field>

        {error && (
          <p className="rounded-lg border border-chili-500/40 bg-chili-500/10 px-3 py-2 text-sm text-chili-400">{error}</p>
        )}

        <button type="submit" disabled={loading} className="w-full rounded-full bg-marigold-500 py-2.5 font-semibold text-dusk-950 transition hover:bg-marigold-400 disabled:opacity-60">
          {loading ? "One moment…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
        className="mt-6 text-sm text-dusk-200 underline decoration-dusk-600 underline-offset-4 hover:text-marigold-400"
      >
        {mode === "login" ? "New vendor? Create an account" : "Already have an account? Log in"}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-dusk-200">{label}</span>
      {children}
    </label>
  );
}
