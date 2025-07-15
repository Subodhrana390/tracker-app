"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import withAuth from "@/components/withAuth";
import {
  Upload,
  Trash2,
  Link,
  FileText,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

function ProjectSection() {
  const [projects, setProjects] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await axios.get("/api/project");
        if (res.data) setProjects(res.data);
      } catch (err) {
        console.error("Failed to load projects", err);
        setError({
          message: "Failed to load your projects.",
          details: err.response?.data?.message || "Please try again later."
        });
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("title", e.target.title.value.trim());
    formData.append("description", e.target.description.value.trim());
    formData.append("link", e.target.link.value.trim());

    if (!e.target.projectReport.files[0]) {
      setError({
        message: "Missing file",
        details: "Please upload your project report"
      });
      setIsSubmitting(false);
      return;
    }
    formData.append("projectReport", e.target.projectReport.files[0]);

    try {
      const res = await axios.post("/api/project", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setProjects((prev) => [res.data, ...(Array.isArray(prev) ? prev : [])]);
      setSuccess(true);
      e.target.reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError({
        message: "Submission failed",
        details: err.response?.data?.message || "Please check your input and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    try {
      await axios.delete(`/api/project?id=${id}`);
      setProjects((prev) => prev.filter((proj) => proj._id !== id));
    } catch (err) {
      console.error("Failed to delete project", err);
      setError({
        message: "Deletion failed",
        details: err.response?.data?.message || "Could not delete project."
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Project Submission</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              name="title"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter project title"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows="4"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your project..."
            ></textarea>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Link className="h-4 w-4" />
              Project Link (GitHub, Website, etc.)
            </label>
            <input
              name="link"
              type="url"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Project Report (PDF only)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Choose File
                <input
                  name="projectReport"
                  type="file"
                  accept=".pdf"
                  required
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500">Max 5MB</span>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error.message}</h3>
                  <p className="text-sm text-red-700 mt-1">{error.details}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success!</h3>
                  <p className="text-sm text-green-700 mt-1">Project submitted successfully.</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex justify-center items-center ${isSubmitting
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Submitting...
              </>
            ) : (
              "Submit Project"
            )}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Your Submitted Projects
        </h3>

        {loadingProjects ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No projects submitted yet
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="p-5 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">{proj.title}</h4>
                    <p className="text-gray-600 mt-1">{proj.description}</p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Link className="h-4 w-4" />
                        Project Link
                      </a>
                      {proj.reportPath && (
                        <a
                          href={proj.reportPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="h-4 w-4" />
                          Download Report
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(proj._id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ProjectSection);