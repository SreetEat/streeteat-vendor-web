import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, vendorId, logout } = useAuth();
  const navigate = useNavigate();

  return (
      <header className="sticky top-0 z-20 border-b border-dusk-700 bg-dusk-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold tracking-tight text-paper-50">
            Street<span className="text-marigold-500">Eat</span>
          </span>
            <span className="hidden font-mono text-xs text-dusk-400 sm:inline">for vendors</span>
          </Link>

          <div className="flex items-center gap-4">
            {user && vendorId && (
                <Link to="/dashboard" className="text-sm text-dusk-200 hover:text-marigold-400">
                  Dashboard
                </Link>
            )}

            {user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm text-dusk-200 sm:inline">{user.name.split(" ")[0]}'s stall</span>
                  <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="rounded-full border border-dusk-600 px-4 py-1.5 text-sm text-dusk-200 transition hover:border-chili-500 hover:text-chili-400"
                  >
                    Log out
                  </button>
                </div>
            ) : (
                <Link
                    to="/auth"
                    className="rounded-full bg-marigold-500 px-4 py-1.5 text-sm font-semibold text-dusk-950 transition hover:bg-marigold-400"
                >
                  Log in
                </Link>
            )}
          </div>
        </div>
      </header>
  );
}