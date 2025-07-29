"use client";

import React, { useState, useEffect } from "react";
import withAuth from "@/components/withAuth";
import axios from "axios";
import {
  User,
  Mail,
  BookOpen,
  Bookmark,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Helper components for better organization
const LoadingState = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading your profile...</p>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md w-full">
      <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        User not found
      </h2>
      <p className="text-gray-600">Please log in to access your profile.</p>
    </div>
  </div>
);

const ProfileHeader = ({
  name,
  email,
  previewUrl,
  onProfilePicChange,
  uploading,
}) => (
  <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-8 text-white">
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-400 flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
        <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer group-hover:bg-gray-100 transition">
          <Upload className="h-5 w-5 text-blue-600" />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onProfilePicChange(e.target.files[0])}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {uploading && (
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold">{name || "Your Name"}</h1>
        <p className="text-blue-100 flex items-center justify-center sm:justify-start gap-2 mt-1">
          <Mail className="h-4 w-4" />
          {email || "your.email@example.com"}
        </p>
      </div>
    </div>
  </div>
);

const StatusMessage = ({ type, message }) => (
  <div
    className={`rounded-md p-4 ${
      type === "error" ? "bg-red-50" : "bg-green-50"
    }`}
  >
    <div className="flex">
      <div className="flex-shrink-0">
        {type === "error" ? (
          <XCircle className="h-5 w-5 text-red-400" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-400" />
        )}
      </div>
      <div className="ml-3">
        <p
          className={`text-sm font-medium ${
            type === "error" ? "text-red-800" : "text-green-800"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  </div>
);

const ProfileField = ({
  Icon,
  label,
  value,
  onChange,
  type = "text",
  disabled,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-500" />
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      disabled={disabled}
    />
  </div>
);

const SaveButton = ({ saving, uploading, onClick }) => (
  <button
    onClick={onClick}
    disabled={saving || uploading}
    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
      saving || uploading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
  >
    {saving ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </>
    ) : (
      "Save Changes"
    )}
  </button>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    urn: "",
    crn: "",
    email: "",
  });
  const [profilePicFile, setProfilePicFile] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const res = await axios.get("/api/user/profile");

      const data = res.data;

      setUser(data.user);
      setFormData({
        name: data.user.name || "",
        urn: data.user.urn || "",
        crn: data.user.crn || "",
        email: data.user.email || "",
      });

      if (data.user.profilePic) setPreviewUrl(data.user.profilePic);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onProfilePicChange = async (file) => {
    try {
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploading(true);

      const formData = new FormData();
      formData.append("profilePic", file);

      const uploadRes = await axios.post("/api/user/upload", formData);

      setPreviewUrl(`${uploadRes.data.profilePic}`);
      fetchProfile();
      setSuccess("Profile picture uploaded successfully!");
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Update profile details
      const updateRes = await axios.post("/api/user/profile", {
        ...formData,
        profilePic: previewUrl,
      });

      setUser(updateRes.data.user);
      setPreviewUrl(updateRes.data.user.profilePic);
      setProfilePicFile(null);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error(
        "Error updating profile:",
        err.response?.data?.error || err.message
      );
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!user) return <ErrorState />;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ProfileHeader
            name={formData.name}
            email={formData.email}
            previewUrl={previewUrl}
            onProfilePicChange={onProfilePicChange}
            uploading={uploading}
          />

          <div className="px-6 py-8 space-y-6">
            {error && <StatusMessage type="error" message={error} />}
            {success && <StatusMessage type="success" message={success} />}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ProfileField
                Icon={User}
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange("name")}
                disabled={saving}
              />

              <ProfileField
                Icon={Mail}
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={saving}
              />

              <ProfileField
                Icon={BookOpen}
                label="URN"
                value={formData.urn}
                onChange={handleInputChange("urn")}
                disabled={saving}
              />

              <ProfileField
                Icon={Bookmark}
                label="CRN"
                value={formData.crn}
                onChange={handleInputChange("crn")}
                disabled={saving}
              />
            </div>

            <div className="flex justify-end pt-4">
              <SaveButton
                saving={saving}
                uploading={uploading}
                onClick={handleSave}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Profile);
