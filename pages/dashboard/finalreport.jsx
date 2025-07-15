"use client";
import withAuth from "@/components/withAuth";
import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const FinalReport = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title) {
      return setMessage({
        text: "Please provide a title and select a file",
        type: "error",
      });
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("report", file);

    try {
      const res = await fetch("/api/finalreport", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          text: "Final report uploaded successfully!",
          type: "success",
        });
        setTitle("");
        setDescription("");
        setFile(null);
        setFileName("");
      } else {
        setMessage({
          text: data.error || "Upload failed. Please try again.",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({
        text: "Network error. Please check your connection.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white/10 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Submit Final Report</h2>
            <p className="mt-2 text-blue-100">
              Upload your completed project documentation
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-8 space-y-6">
            {message.text && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${
                  message.type === "error"
                    ? "bg-red-50 text-red-800"
                    : "bg-green-50 text-green-800"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter project title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Briefly describe your project"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Report File *
                </label>
                <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                  <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium text-blue-600">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX (Max. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                    required
                  />
                </label>
                {fileName && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{fileName}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-medium ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } transition-colors`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Need help? Contact support at{" "}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:underline"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default withAuth(FinalReport);
