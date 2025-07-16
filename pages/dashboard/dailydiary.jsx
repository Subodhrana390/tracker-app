"use client";
import { useState, useEffect } from "react";
import {
  Calendar,
  Heart,
  Sparkles,
  Camera,
  BookOpen,
  Save,
  Image,
  FileText,
  Loader2,
} from "lucide-react";
import withAuth from "@/components/withAuth";
import axios from "axios";

// Reusable components
const DayButton = ({ day, currentDay, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(day)}
    className={`relative w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
      currentDay === day
        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-110 ring-4 ring-purple-200"
        : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md hover:scale-105 border border-gray-200"
    }`}
  >
    {day}
    {currentDay === day && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
    )}
  </button>
);

const FileUploadButton = ({
  accept,
  onChange,
  label,
  icon: Icon,
  description,
  currentFile,
}) => (
  <div className="group relative">
    <label className="cursor-pointer flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 transition-all duration-300 min-h-[120px]">
      <Icon className="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-colors mb-2" />
      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
        {label}
      </span>
      {description && (
        <p className="text-xs text-gray-500 mt-1 text-center">{description}</p>
      )}
      {currentFile && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      )}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files[0])}
      />
    </label>
  </div>
);

const SubmitButton = ({ isSubmitting, handleSubmit }) => (
  <button
    type="submit"
    onClick={handleSubmit}
    disabled={isSubmitting}
    className={`w-full py-4 px-6 rounded-xl font-semibold text-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 ${
      isSubmitting
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105"
    }`}
  >
    {isSubmitting ? (
      <span className="flex items-center justify-center gap-3">
        <Loader2 className="animate-spin h-5 w-5" />
        Saving your memories...
      </span>
    ) : (
      <span className="flex items-center justify-center gap-2">
        <Save className="h-5 w-5" />
        Save Diary Entry
      </span>
    )}
  </button>
);

const FormSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50 space-y-4 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-purple-600" />}
      <label className="block text-sm font-semibold text-gray-800">
        {title}
      </label>
    </div>
    {children}
  </div>
);

// Main component
function DiarySection() {
  const [currentDay, setCurrentDay] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mood: "",
    mediaFile: null,
    reportFile: null,
  });

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const res = await axios.get(`/api/current/${currentDay}`);

        const { title, description, mood, media, reportPdf } = res.data;
        setFormData({
          title: title || "",
          description: description || "",
          mood: mood || "",
          mediaFile: media || null,
          reportFile: reportPdf || null,
        });
      } catch (err) {
        console.error("Failed to fetch diary:", err);
        setFormData({
          title: "",
          description: "",
          mood: "",
          mediaFile: null,
          reportFile: null,
        });
      }
    };

    fetchDiary();
  }, [currentDay]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (field) => (file) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("mood", formData.mood);
    if (formData.mediaFile) data.append("media", formData.mediaFile);
    if (formData.reportFile) data.append("report", formData.reportFile);
    data.append("day", currentDay);

    try {
      const res = await axios.post("/api/diary", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        // Show success message or redirect
        console.log("Diary submitted:", res.data);
      } else {
        console.error("Submission error:", res.data.error);
      }
    } catch (error) {
      console.error("Failed to submit diary:", error);
      setError("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleDays = showAllDays ? 28 : 14;
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Daily Journal
            </h1>
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-gray-600 text-lg">{currentMonth}</p>
        </div>

        {/* Day Navigation */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Day {currentDay}
              </h2>
            </div>
            <button
              onClick={() => setShowAllDays(!showAllDays)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {showAllDays ? "Show Less" : "Show All Days"}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: visibleDays }, (_, i) => (
              <DayButton
                key={i + 1}
                day={i + 1}
                currentDay={currentDay}
                onClick={setCurrentDay}
              />
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className="space-y-6">
          {/* Title Section */}
          <FormSection title="Today's Highlight" icon={Sparkles}>
            <input
              type="text"
              placeholder="What made today special?"
              required
              value={formData.title}
              onChange={handleInputChange("title")}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500"
            />
          </FormSection>

          {/* Description Section */}
          <FormSection title="Your Story" icon={BookOpen}>
            <textarea
              placeholder="Share your thoughts, experiences, and reflections..."
              rows={6}
              required
              value={formData.description}
              onChange={handleInputChange("description")}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500 resize-none"
            />
          </FormSection>

          {/* Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mood Section */}
            <FormSection title="How are you feeling?" icon={Heart}>
              <select
                required
                value={formData.mood}
                onChange={handleInputChange("mood")}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm text-gray-800"
              >
                <option value="">Select your mood</option>
                <option value="Excited">🌟 Excited</option>
                <option value="Happy">😊 Happy</option>
                <option value="Grateful">🙏 Grateful</option>
                <option value="Peaceful">🕊️ Peaceful</option>
                <option value="Neutral">😐 Neutral</option>
                <option value="Tired">😴 Tired</option>
                <option value="Stressed">😫 Stressed</option>
                <option value="Sad">😔 Sad</option>
              </select>
            </FormSection>

            {/* Media Upload */}
            <FormSection title="Capture the moment" icon={Camera}>
              <FileUploadButton
                accept="image/*,video/*"
                onChange={handleFileChange("mediaFile")}
                label="Add Photo/Video"
                icon={Image}
                description="JPEG, PNG, MP4 (Max 5MB)"
                currentFile={formData.mediaFile}
              />
            </FormSection>

            {/* Report Upload */}
            <FormSection title="Additional Documents" icon={FileText}>
              <FileUploadButton
                accept="application/pdf"
                onChange={handleFileChange("reportFile")}
                label="Upload PDF"
                icon={FileText}
                description="PDF only (Max 5MB)"
                currentFile={formData.reportFile}
              />
            </FormSection>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <SubmitButton
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Every day is a new page in your story 📖</p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DiarySection);
