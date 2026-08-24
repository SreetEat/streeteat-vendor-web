import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SetupVendorPage() {
  const { setVendorProfileId } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location lookup — enter coordinates manually.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          update("latitude", pos.coords.latitude.toFixed(6));
          update("longitude", pos.coords.longitude.toFixed(6));
          setLocating(false);
        },
        () => {
          setError("Couldn't get your location — enter coordinates manually.");
          setLocating(false);
        }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const vendor = await api.createVendor({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      setVendorProfileId(vendor.id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-chili-400">one more step</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-paper-50">Set up your stall</h1>
        <p className="mt-2 text-dusk-200">
          This is what customers will see when they browse the market. You can edit it anytime.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Field label="Stall name">
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="input" placeholder="e.g. Rani's Chaat Corner" />
          </Field>

          <Field label="Public contact email">
            <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" placeholder="stall@example.com" />
            <span className="mt-1 block text-xs text-dusk-400">
            Tip: use the same email you log in with — it helps this app find your stall later.
          </span>
          </Field>

          <Field label="Phone">
            <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" placeholder="9876500000" />
          </Field>

          <Field label="Address">
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className="input" placeholder="Street, area, city" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <input required type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className="input" placeholder="28.6139" />
            </Field>
            <Field label="Longitude">
              <input required type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className="input" placeholder="77.2090" />
            </Field>
          </div>

          <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="text-sm text-marigold-400 underline decoration-dusk-600 underline-offset-4 hover:text-marigold-300"
          >
            {locating ? "Locating…" : "📍 Use my current location"}
          </button>

          {error && (
              <p className="rounded-lg border border-chili-500/40 bg-chili-500/10 px-3 py-2 text-sm text-chili-400">{error}</p>
          )}

          <button type="submit" disabled={loading} className="w-full rounded-full bg-marigold-500 py-2.5 font-semibold text-dusk-950 transition hover:bg-marigold-400 disabled:opacity-60">
            {loading ? "Setting up…" : "Open my stall"}
          </button>
        </form>
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