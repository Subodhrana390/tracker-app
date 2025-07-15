import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  Calendar,
  AlertCircle,
  Loader2,
  FileSearch,
} from "lucide-react";

const ShowFinalReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await axios.get("/api/finalreport");
        setReports(res.data);
      } catch (err) {
        setError("Failed to load reports. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200 flex flex-col items-center text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-medium text-red-600 mb-1">
          Error Loading Reports
        </h3>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm text-center">
        <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
          <FileSearch className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Reports Found
        </h3>
        <p className="text-gray-500">
          No final reports have been submitted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Final Reports</h1>
        <p className="text-gray-500 mt-1">
          {reports.length} report{reports.length !== 1 ? "s" : ""} submitted
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(({ _id, title, description, reportPath, submittedAt }) => (
          <div
            key={_id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4" />
                <span>
                  Submitted:{" "}
                  {new Date(submittedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <a
                href={reportPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Report
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowFinalReport;
