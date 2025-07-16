"use client";
import AdminSidebar from "./AdminSidebar";
import { useRouter } from "next/router";
import axios from "axios";
import { useEffect, useState } from "react";
import { Loader2, Menu, X } from "lucide-react"; // Using Lucide icons

const ModernLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const res = await axios.get("/api/user/profile");
        setUser(res.data.user || null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    axios.post("/api/auth/logout");
    router.push("/auth/login");
  };

  const handleToggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-600 text-lg">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          Loading user data...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile Menu Button - Using Lucide Menu icon */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-600"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 -z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={`hidden md:block fixed h-full ${
          isCollapsed ? "w-20" : "w-64"
        } transition-all duration-300 ease-in-out`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          handleLogout={handleLogout}
          user={user}
        />
      </div>

      {/* Sidebar - Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50">
            <AdminSidebar
              isCollapsed={false}
              onToggleCollapse={handleToggleCollapse}
              handleLogout={handleLogout}
              user={user}
              isMobile={true}
              onClose={toggleMobileMenu}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:px-6 lg:px-8 xl:px-20">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;
