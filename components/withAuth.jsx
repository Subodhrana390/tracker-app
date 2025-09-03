import React, { useState, useEffect } from "react";
import ModernLayout from "./ModernLayout";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        setIsLoading(true);
        // Simulate authentication check delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
      };
      checkAuth();
    }, []);

    useEffect(() => {
      if (!user && !isLoading) {
        router.push("/auth/login");
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return (
      <ModernLayout>
        <WrappedComponent {...props} />
      </ModernLayout>
    );
  };
};

export default withAuth;
