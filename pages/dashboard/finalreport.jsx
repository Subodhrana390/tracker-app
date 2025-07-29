"use client";
import withAuth from "@/components/withAuth";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  Clock,
  Edit,
  X,
} from "lucide-react";

const Message = ({ type, text, onClose }) => {
  if (!text) return null;

  const iconMap = {
    error: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    loading: <Loader2 className="h-5 w-5 animate-spin" />,
  };

  const colorMap = {
    error: "bg-red-50 text-red-800 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
    loading: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <div
      className={`flex items-start justify-between p-4 mb-6 rounded-lg border ${colorMap[type]}`}
    >
      <div className="flex items-start gap-3">
        {iconMap[type]}
        <p>{text}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-4"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

const FinalReport = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [submittedReport, setSubmittedReport] = useState(null);

  useEffect(() => {
    fetchReportStatus();
  }, []);

  const fetchReportStatus = async () => {
    try {
      const res = await axios.get("/api/finalreport/status");
      if (res.data.submitted) {
        setSubmittedReport(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description || "");
      }
    } catch (err) {
      console.error("Error fetching report status:", err);
    }
  };

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
    setMessage({ text: "Uploading your report...", type: "loading" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("report", file);

    try {
      const res = await axios.post("/api/finalreport", formData);
      setMessage({
        text: "Report uploaded successfully!",
        type: "success",
      });
      setFile(null);
      setFileName("");
      fetchReportStatus();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Upload failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessage = () => {
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-6 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8" />
          <h2 className="text-2xl font-semibold">
            {submittedReport ? "Your Final Report" : "Submit Final Report"}
          </h2>
        </div>

        <div className="px-6 py-8 space-y-6">
          <Message
            type={message.type}
            text={message.text}
            onClose={clearMessage}
          />

          {submittedReport && (
            <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Submitted Report</h3>
                <a
                  href={submittedReport.reportPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
              <p className="font-medium">{submittedReport.title}</p>
              {submittedReport.description && (
                <p className="text-gray-600">{submittedReport.description}</p>
              )}
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>
                  Submitted:{" "}
                  {new Date(submittedReport.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter your project title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report File *
              </label>
              <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg bg-gray-50 hover:border-blue-400 cursor-pointer transition-colors">
                <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload</p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX (Max. 10MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {fileName && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="truncate flex-1">{fileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileName("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!file && !submittedReport)}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } transition-colors`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {submittedReport ? "Updating..." : "Uploading..."}
                </>
              ) : submittedReport ? (
                <>
                  <Edit className="h-5 w-5" />
                  Update Report
                </>
              ) : (
                <>
                  <UploadCloud className="h-5 w-5" />
                  Submit Report
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default withAuth(FinalReport);
