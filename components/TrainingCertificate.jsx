import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  Calendar,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";

const TrainingCertificate = () => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await axios.get("/api/user/certificate");
        if (res.data && res.data.course) {
          setCertificate(res.data);
        } else {
          setError("No certificate uploaded");
        }
      } catch (err) {
        setError("Failed to load certificate data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-600">Checking certificate status...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm text-center border border-gray-200">
        <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
          <AlertCircle className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Certificate Uploaded
        </h3>
        <p className="text-gray-500 mb-4">
          Your certificate has not been uploaded yet.
        </p>
        <div className="space-y-3">
          <a
            href="/dashboard/certificate"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload Certificate
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Training Certificate</h1>
            <p className="text-blue-100 mt-1">Certificate of Completion</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <FileText className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="bg-white p-8 border border-gray-200 rounded-b-xl shadow-sm">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Course Name</h3>
              <p className="text-lg font-semibold mt-1">{certificate.course}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Completion Date
              </h3>
              <p className="text-lg font-semibold mt-1">
                {new Date(certificate.completionDate).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        {certificate.filePath && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <a
              href={certificate.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </a>
            <p className="text-sm text-gray-500 mt-3">
              This is your official certificate of completion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingCertificate;
