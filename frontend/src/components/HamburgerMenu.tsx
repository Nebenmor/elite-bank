import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Menu, 
  X, 
  Home, 
  Send, 
  Users, 
  LogOut,
  Wallet,
  Building2
} from "lucide-react";

const HamburgerMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: Home,
      description: "Account overview",
    },
    {
      label: "Transfer",
      path: "/transfer",
      icon: Send,
      description: "Send money",
    },
    {
      label: "Beneficiaries",
      path: "/beneficiaries",
      icon: Users,
      description: "Manage contacts",
    },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-200 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <button
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(false);
            }
          }}
          aria-label="Close menu overlay"
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Elite Bank</h2>
                <p className="text-sm text-gray-600">Digital Banking</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.fullName}</p>
              <p className="text-sm text-gray-600 font-mono">{user.accountNumber}</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-6 border-b border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="h-5 w-5 text-blue-100" />
              <p className="text-blue-100 text-sm font-medium">Available Balance</p>
            </div>
            <p className="text-white text-xl font-bold">
              {formatCurrency(user.balance)}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 w-full px-4 py-4 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all duration-200"
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Logout</p>
              <p className="text-xs text-red-400">Sign out securely</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;