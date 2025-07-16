"use client";
import React, { useState, useEffect } from "react";
import { LogOutIcon, User, Menu, X } from "lucide-react";
import { useRouter } from "next/router";

const AdminSidebar = ({
  isCollapsed,
  onToggleCollapse,
  user,
  handleLogout,
  isMobile,
  onClose,
}) => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // Set active item based on current route
    const path = router.pathname.split("/")[1] || "dashboard";
    setActiveItem(path);
  }, [router.pathname]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "dashboard/profile", label: "Profile", icon: "👤" },
    { id: "dashboard/certificate", label: "Certificate", icon: "🏆" },
    { id: "dashboard/finalreport", label: "Final Report", icon: "📝" },
    { id: "dashboard/dailydiary", label: "Daily Dairy", icon: "📅" },
    { id: "dashboard/project", label: "Project", icon: "📁" },
  ];

  const handleNavigation = (itemId) => {
    setActiveItem(itemId);
    router.push(`/${itemId}`);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Don't render on server to avoid hydration mismatch
  if (!isMounted) return null;

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white/80 backdrop-blur-xl shadow-2xl flex flex-col 
          transition-all duration-300 border-r border-white/20 overflow-hidden
          ${isMobile ? "w-64" : isCollapsed ? "w-20" : "w-64"}
          ${isMobile ? "translate-x-0" : ""}
        `}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>

        {/* Header */}
        <div className="relative p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Student Panel
                  </h2>
                  <p className="text-xs text-gray-500">Management System</p>
                </div>
              </div>
            )}
            {!isMobile && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors backdrop-blur-sm"
              >
                <span className="text-gray-600">{isCollapsed ? "☰" : "✕"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`
                relative w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group
                ${
                  activeItem === item.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
                }
                ${isCollapsed && !isMobile ? "justify-center" : ""}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {(!isCollapsed || isMobile) && (
                <span className="font-medium flex-1 text-left">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="relative p-3 border-t border-white/20 space-y-3">
          <div
            className={`flex items-center gap-3 p-2 rounded-lg ${
              isCollapsed && !isMobile ? "justify-center" : ""
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>

            {(!isCollapsed || isMobile) && (
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              handleLogout();
              router.push("/auth/login");
            }}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-sm font-medium
              ${isCollapsed && !isMobile ? "justify-center" : ""}
              text-red-600 hover:bg-red-50
            `}
          >
            <LogOutIcon className="w-5 h-5" />
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
