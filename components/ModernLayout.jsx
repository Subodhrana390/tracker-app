import AdminSidebar from "./AdminSidebar";
import { useRouter } from "next/router";
import axios from "axios";
import { useEffect, useState } from "react";

const ModernLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-600 text-lg">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 -z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Fixed Sidebar */}
      <div
        className={`fixed h-full ${
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

      {/* Main Content Area with sidebar offset */}
      <div
        className={`flex-1 flex flex-col ml-0 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        } transition-all duration-300 ease-in-out`}
      >
        <main className="flex-1 overflow-auto">
          <div className="px-20">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;
