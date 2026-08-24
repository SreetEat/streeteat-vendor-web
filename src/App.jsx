import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import SetupVendorPage from "./pages/SetupVendorPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./context/AuthContext";

function Gate({ children }) {
    const { user, vendorId, resolvingVendor } = useAuth();

    if (!user) return <Navigate to="/auth" replace />;
    if (resolvingVendor) {
        return <p className="mx-auto max-w-md px-6 py-16 text-center text-dusk-200">Finding your stall…</p>;
    }
    if (!vendorId) return <Navigate to="/setup" replace />;
    return children;
}

export default function App() {
    return (
        <div className="min-h-screen">
            <NavBar />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/setup" element={<SetupVendorPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <Gate>
                                <DashboardPage />
                            </Gate>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}