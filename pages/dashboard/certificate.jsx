"use client";

import React, { useState, useEffect } from "react";
import { FileCheck, UploadCloud, X, FileText, Image } from "lucide-react";
import axios from "axios";
import withAuth from "@/components/withAuth";

function CertificateSection() {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedCertificate, setUploadedCertificate] = useState(null);
  const [existingCertificate, setExistingCertificate] = useState(null);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchExistingCertificate = async () => {
      try {
        const response = await axios.get("/api/user/certificate");

        if (response.data) {
          setExistingCertificate(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch existing certificate:", err);
      }
    };

    fetchExistingCertificate();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsUploading(false);
    setError("");
    setUploadedCertificate(null);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type === "application/pdf") {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
      setError("Unsupported file type. Please upload an image or PDF.");
      return;
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const uploaded = await uploadCertificate(file);
      setUploadedCertificate(uploaded);
      setExistingCertificate(uploaded);
      setPreviewUrl(null);
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.error || err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setFile(null);
    setError("");
  };

  const uploadCertificate = async (file) => {
    const formData = new FormData();
    formData.append("certificate", file);

    const response = await axios.post("/api/user/certificate", formData);

    return response.data.certificate;
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (fileType === "application/pdf") return <FileText className="w-5 h-5" />;
    return <FileCheck className="w-5 h-5" />;
  };

  return (
    <div className="max-w-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Certificate Upload</h2>
        <p className="text-gray-600 mt-1">
          Upload your certification documents for verification
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <UploadCloud className="w-10 h-10 mb-3 text-blue-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Drag and drop files here
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, PDF (Max 5MB)
            </p>
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* File Preview */}
        {previewUrl && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getFileIcon(file?.type)}
                <span className="font-medium text-gray-700 truncate max-w-xs">
                  {file?.name}
                </span>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-2">
              {previewUrl.endsWith(".pdf") ? (
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded">
                  <FileText className="w-12 h-12 text-red-500 mb-2" />
                  <span className="text-sm text-gray-600">PDF Preview</span>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-64 object-contain rounded border"
                />
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Uploading...
                  </>
                ) : (
                  "Upload Certificate"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Existing Certificate */}
        {existingCertificate && !previewUrl && !uploadedCertificate && (
          <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-green-800">
                Your Current Certificate
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            </div>

            <div className="mt-4">
              {existingCertificate.filePath?.endsWith(".pdf") ? (
                <div className="flex flex-col items-center p-6 bg-white rounded-lg border">
                  <FileText className="w-12 h-12 text-red-500 mb-3" />
                  <a
                    href={existingCertificate.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View PDF Certificate
                  </a>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={existingCertificate.filePath}
                      alt="Certificate"
                      className="w-48 h-auto rounded-lg border object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Certificate ID
                        </p>
                        <p className="text-sm text-gray-900">
                          {existingCertificate._id}
                        </p>
                      </div>
                      {existingCertificate.completionDate && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Completion Date
                          </p>
                          <p className="text-sm text-gray-900">
                            {new Date(
                              existingCertificate.completionDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CertificateSection);
