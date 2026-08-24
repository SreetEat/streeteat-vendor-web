import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import DishIcon from "../components/DishIcon";
import { resizeImageToDataUrl } from "../lib/image";

const STATUS_STYLE = {
  PENDING: "bg-marigold-500/15 text-marigold-300 border-marigold-500/40",
  ACCEPTED: "bg-mint-500/15 text-mint-300 border-mint-500/40",
  READY: "bg-chili-500/15 text-chili-300 border-chili-500/40",
  OUT_FOR_DELIVERY: "bg-dusk-600/40 text-dusk-200 border-dusk-500",
  DELIVERED: "bg-dusk-700/40 text-dusk-400 border-dusk-600",
  REJECTED: "bg-dusk-700/40 text-dusk-400 border-dusk-600",
  CANCELLED: "bg-dusk-700/40 text-dusk-400 border-dusk-600",
};

export default function DashboardPage() {
  const { vendorId } = useAuth();
  const [tab, setTab] = useState("orders");

  return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex gap-2 rounded-full border border-dusk-700 bg-dusk-900 p-1 w-fit">
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
            Orders
          </TabButton>
          <TabButton active={tab === "menu"} onClick={() => setTab("menu")}>
            Menu
          </TabButton>
        </div>

        {tab === "orders" ? <OrdersPanel /> : <MenuPanel vendorId={vendorId} />}
      </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
      <button
          onClick={onClick}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              active ? "bg-marigold-500 text-dusk-950" : "text-dusk-200 hover:text-paper-50"
          }`}
      >
        {children}
      </button>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    api
        .myOrders()
        .then((page) => setOrders(page.content))
        .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function act(action, order) {
    setBusyId(order.id);
    try {
      if (action === "accept") await api.acceptOrder(order.id);
      if (action === "reject") await api.rejectOrder(order.id, "Vendor unable to fulfil");
      if (action === "ready") await api.markReady(order.id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return <p className="text-chili-400">Couldn't load orders: {error}</p>;
  }
  if (!orders) {
    return <p className="text-dusk-200">Loading orders…</p>;
  }
  if (orders.length === 0) {
    return (
        <div className="rounded-xl border border-dusk-700 bg-dusk-900 px-6 py-10 text-center text-dusk-200">
          No orders yet. Once a customer orders from your stall, it'll show up here — this list
          refreshes automatically every 10 seconds.
        </div>
    );
  }

  return (
      <div className="space-y-4">
        {orders.map((order) => (
            <div key={order.id} className="stall-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-paper-50">Order #{order.id}</p>
                  <span
                      className={`mt-1 inline-block rounded-full border px-3 py-0.5 font-mono text-xs uppercase tracking-wide ${STATUS_STYLE[order.status] || ""}`}
                  >
                {order.status}
              </span>
                </div>
                <span className="price-tag">₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>

              <ul className="mt-4 space-y-1.5 border-t border-dusk-700 pt-3">
                {order.items.map((item) => (
                    <li key={item.menuItemId} className="flex items-center justify-between text-sm text-dusk-200">
                      <span>{item.quantity} × {item.menuItemName}</span>
                      <span className="font-mono">₹{Number(item.lineTotal).toFixed(2)}</span>
                    </li>
                ))}
              </ul>

              {order.status === "PENDING" && (
                  <div className="mt-4 flex gap-3">
                    <button
                        disabled={busyId === order.id}
                        onClick={() => act("accept", order)}
                        className="rounded-full bg-mint-500 px-4 py-1.5 text-sm font-semibold text-dusk-950 transition hover:bg-mint-400 disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                        disabled={busyId === order.id}
                        onClick={() => act("reject", order)}
                        className="rounded-full border border-chili-500/50 px-4 py-1.5 text-sm font-semibold text-chili-400 transition hover:bg-chili-500/10 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
              )}

              {order.status === "ACCEPTED" && (
                  <div className="mt-4">
                    <button
                        disabled={busyId === order.id}
                        onClick={() => act("ready", order)}
                        className="rounded-full bg-marigold-500 px-4 py-1.5 text-sm font-semibold text-dusk-950 transition hover:bg-marigold-400 disabled:opacity-60"
                    >
                      Mark ready for pickup
                    </button>
                    <p className="mt-1.5 text-xs text-dusk-400">
                      This finds and assigns the nearest available delivery partner automatically.
                    </p>
                  </div>
              )}
            </div>
        ))}
      </div>
  );
}

function MenuPanel({ vendorId }) {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", price: "" });
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!vendorId) return;
    api
        .listMenu(vendorId)
        .then(setMenu)
        .catch((err) => setError(err.message));
  }, [vendorId]);

  useEffect(load, [load]);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setImageDataUrl(dataUrl);
    } catch (err) {
      setImageError(err.message);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createMenuItem(vendorId, {
        name: form.name,
        price: Number(form.price),
        available: true,
        imageUrl: imageDataUrl || undefined,
      });
      setForm({ name: "", price: "" });
      setImageDataUrl(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(item) {
    try {
      await api.updateMenuItem(vendorId, item.id, {
        name: item.name,
        price: item.price,
        available: !item.available,
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Remove "${item.name}" from your menu?`)) return;
    try {
      await api.deleteMenuItem(vendorId, item.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
      <div>
        <form onSubmit={handleAdd} className="stall-card mb-6 space-y-4 p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[160px]">
              <span className="mb-1.5 block text-sm text-dusk-200">Dish name</span>
              <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input"
                  placeholder="e.g. Pani Puri"
              />
            </label>
            <label className="w-32">
              <span className="mb-1.5 block text-sm text-dusk-200">Price (₹)</span>
              <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="input"
                  placeholder="50.00"
              />
            </label>
          </div>

          <div className="flex items-center gap-4">
            {imageDataUrl ? (
                <img src={imageDataUrl} alt="Preview" className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-dusk-600 text-xs text-dusk-400">
                  No photo
                </div>
            )}
            <label className="text-sm text-marigold-400 underline decoration-dusk-600 underline-offset-4 hover:text-marigold-300">
              {imageDataUrl ? "Change photo" : "Add a photo (optional)"}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {imageDataUrl && (
                <button
                    type="button"
                    onClick={() => setImageDataUrl(null)}
                    className="text-xs text-chili-400 hover:text-chili-300"
                >
                  Remove
                </button>
            )}
          </div>
          {imageError && <p className="text-xs text-chili-400">{imageError}</p>}

          <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-marigold-500 px-5 py-2.5 font-semibold text-dusk-950 transition hover:bg-marigold-400 disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add to menu"}
          </button>
        </form>

        {error && (
            <p className="mb-4 rounded-lg border border-chili-500/40 bg-chili-500/10 px-3 py-2 text-sm text-chili-400">{error}</p>
        )}

        {!menu ? (
            <p className="text-dusk-200">Loading menu…</p>
        ) : menu.length === 0 ? (
            <p className="text-dusk-200">No dishes yet — add your first one above.</p>
        ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {menu.map((item) => (
                  <div key={item.id} className="stall-card flex items-center gap-4 p-4">
                    <DishIcon name={item.name} imageUrl={item.imageUrl} size={52} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-paper-50">{item.name}</p>
                      <span className="price-tag mt-1.5">₹{Number(item.price).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                          onClick={() => toggleAvailable(item)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                              item.available
                                  ? "bg-mint-500/15 text-mint-300"
                                  : "bg-dusk-700 text-dusk-400"
                          }`}
                      >
                        {item.available ? "Available" : "Sold out"}
                      </button>
                      <button
                          onClick={() => remove(item)}
                          className="text-xs text-chili-400 hover:text-chili-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}