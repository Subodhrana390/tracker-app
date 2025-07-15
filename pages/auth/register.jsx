"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  LogIn,
  Milk,
  Image,
  FileSignature,
  Bookmark,
} from "lucide-react";
import InputField from "@/components/ui/InputField";
import { toast } from "sonner";
import axios from "axios";

const Page = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    urn: "",
    crn: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profilePic: "Image must be less than 2MB",
      }));
      return;
    }
    setProfilePic(file);
    setErrors((prev) => ({ ...prev, profilePic: "" }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.urn.trim()) newErrors.urn = "URN is required";
    if (!formData.crn.trim()) newErrors.crn = "CRN is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("urn", formData.urn);
      formPayload.append("crn", formData.crn);
      formPayload.append("email", formData.email);
      formPayload.append("password", formData.password);
      if (profilePic) formPayload.append("profilePic", profilePic);

      const { data } = await axios.post("/api/auth/register", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An error occurred during registration";
      toast.error(message);
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center">
            <Bookmark className="w-10 h-10 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Daily Diary</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">
            Create Account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <InputField
            icon={<User className="w-5 h-5 text-gray-400" />}
            label="Full Name"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.name}
          />

          {/* Email Field */}
          <InputField
            icon={<Mail className="w-5 h-5 text-gray-400" />}
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={errors.email}
          />

          {/* Password Field */}
          <InputField
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
          />

          {/* Confirm Password Field */}
          <InputField
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
          />

          {/* URN Field */}
          <InputField
            icon={<FileSignature className="w-5 h-5 text-gray-400" />}
            label="URN"
            id="urn"
            name="urn"
            type="text"
            value={formData.urn}
            onChange={handleChange}
            placeholder="University registration number"
            error={errors.urn}
          />

          {/* CRN Field */}
          <InputField
            icon={<FileSignature className="w-5 h-5 text-gray-400" />}
            label="CRN"
            id="crn"
            name="crn"
            type="text"
            value={formData.crn}
            onChange={handleChange}
            placeholder="Course registration number"
            error={errors.crn}
          />

          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Profile Picture (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                <Image className="w-5 h-5" />
                <span className="text-sm font-medium">Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl("");
                      setProfilePic(null);
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            {errors.profilePic && (
              <p className="text-red-500 text-xs mt-1">{errors.profilePic}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white mt-6 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Register
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-blue-600 font-medium hover:underline hover:text-blue-700 transition-colors"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Page;
