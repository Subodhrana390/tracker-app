"use client";
import React, { useState } from "react";
import { LogOutIcon, User } from "lucide-react";
import { useRouter } from "next/router";

const AdminSidebar = ({
  isCollapsed,
  onToggleCollapse,
  user,
  handleLogout,
}) => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const router = useRouter();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "dashboard/profile", label: "Profile", icon: "👤" },
    { id: "dashboard/certificate", label: "Certificate", icon: "🏆" },
    { id: "dashboard/finalreport", label: "Final Report", icon: "🏆" },
    { id: "dashboard/dailydairy", label: "Daily Dairy", icon: "📅" },
    { id: "dashboard/project", label: "Project", icon: "📁" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-50 ${
        isCollapsed ? "w-20" : "w-80"
      } h-screen bg-white/80 backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 border-r border-white/20 relative overflow-hidden`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>

      {/* Header */}
      <div className="relative p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
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
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors backdrop-blur-sm"
          >
            <span className="text-gray-600">{isCollapsed ? "☰" : "✕"}</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveItem(item.id);
              if (isCollapsed) onToggleCollapse();
              router.push(`/${item.id}`);
            }}
            className={`relative w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
              activeItem === item.id
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && (
              <span className="font-medium flex-1 text-left">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="relative p-4 border-t border-white/20 space-y-4">
        <div
          className={`flex items-center gap-3 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            handleLogout();
            router.push("/auth/login");
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-sm font-medium ${
            isCollapsed ? "justify-center" : ""
          } text-red-600 hover:bg-red-50`}
        >
          <LogOutIcon /> {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
