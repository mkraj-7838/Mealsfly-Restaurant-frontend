import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // Get location using useLocation hook

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Token verification failed");

        const data = await res.json();
        setUser({ token, role: data.role });
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  const ProtectedRoute = ({ children, requiredRole }) => {
    const location = useLocation();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
          />
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (user.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="bg-white bg-opacity-80 backdrop-blur-sm"
        bodyClassName="text-gray-800 font-medium"
        progressClassName="bg-gradient-to-r from-amber-500 to-rose-500"
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={`/${user.role}/dashboard`} replace />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AuthPage setUser={setUser} />
                </motion.div>
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <AdminDashboard user={user} handleLogout={handleLogout} />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <UserDashboard user={user} handleLogout={handleLogout} />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;


