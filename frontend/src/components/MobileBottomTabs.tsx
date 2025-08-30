import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Send, Users } from "lucide-react";

const MobileBottomTabs: React.FC = () => {
  const location = useLocation();

  const tabs = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      label: "Transfer",
      path: "/transfer",
      icon: Send,
    },
    {
      label: "Beneficiaries",
      path: "/beneficiaries",
      icon: Users,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-3">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-3 px-1 ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomTabs;