import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Transfer from "./components/Transfer";
import Beneficiaries from "./components/Beneficiaries";
import MobileBottomTabs from "./components/MobileBottomTabs";
import HamburgerMenu from "./components/HamburgerMenu";
import { Building2 } from "lucide-react";

// Loading spinner component with improved branding
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div className="text-center">
      <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
        <Building2 className="h-8 w-8 text-white" />
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
        Elite Bank
      </h3>
      <p className="text-gray-600 font-medium">Loading your secure banking experience...</p>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Public route component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

// Navigation component with improved branding
const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/transfer", label: "Transfer" },
    { path: "/beneficiaries", label: "Beneficiaries" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-3 pl-14 md:pl-0">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Elite Bank</h1>
              </div>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    location.pathname === item.path
                      ? "text-blue-600 bg-blue-50 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user.fullName.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-500">Welcome back</p>
            </div>
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main content wrapper to handle fixed header spacing
const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div
      className={`
        ${user ? "pb-16 md:pb-0 min-h-screen" : "min-h-screen"}
        ${user && !isDashboard ? "pt-16" : ""}
      `}
    >
      {children}
    </div>
  );
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navigation />
      {user && <HamburgerMenu />}
      <ContentWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <ProtectedRoute>
                <Transfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiaries"
            element={
              <ProtectedRoute>
                <Beneficiaries />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ContentWrapper>
      {user && <MobileBottomTabs />}
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#fff",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              style: {
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#10B981",
              },
            },
            error: {
              style: {
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#EF4444",
              },
            },
            loading: {
              style: {
                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                color: "#fff",
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
};

export default App;