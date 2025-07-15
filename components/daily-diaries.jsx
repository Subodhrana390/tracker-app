"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  BookOpenText,
  Smile,
  FileText,
  ChevronDown,
  Loader2,
  ImageIcon,
} from "lucide-react";

export default function DailyDiariesPage() {
  const [diaries, setDiaries] = useState([]);
  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchDiaries() {
      setLoading(true);
      try {
        const res = await axios.get("/api/daily-diaries");
        setDiaries(res.data);
        setFilteredDiaries(res.data);
      } catch (err) {
        console.error("Error fetching diaries:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDiaries();
  }, []);

  useEffect(() => {
    if (selectedDay === "all") {
      setFilteredDiaries(diaries);
    } else {
      setFilteredDiaries(
        diaries.filter((entry) => entry.day === parseInt(selectedDay))
      );
    }
  }, [selectedDay, diaries]);

  const allDays = Array.from({ length: 28 }, (_, i) => i + 1);
  const uniqueDays = [...new Set(diaries.map((entry) => entry.day))].sort(
    (a, b) => a - b
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (diaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6">
        <BookOpenText className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          No diary entries yet
        </h2>
        <p className="text-gray-500 mt-2">
          Start documenting your journey by creating your first entry
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpenText className="h-8 w-8" />
            My Diary Journey
          </h1>
          <p className="text-gray-600 mt-1">
            Review your daily reflections and progress
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <CalendarDays className="h-5 w-5 text-gray-700" />
            {selectedDay === "all" ? "All Days" : `Day ${selectedDay}`}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1 max-h-60 overflow-auto">
                <button
                  onClick={() => {
                    setSelectedDay("all");
                    setDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${selectedDay === "all"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  All Days
                </button>
                {allDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      setDropdownOpen(false);
                    }}
                    disabled={!uniqueDays.includes(day)}
                    className={`block w-full text-left px-4 py-2 text-sm ${selectedDay === day
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                      } ${!uniqueDays.includes(day)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                      }`}
                  >
                    Day {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredDiaries.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
            <p className="text-gray-500">
              No entries found for Day {selectedDay}
            </p>
          </div>
        ) : (
          filteredDiaries.map((entry) => (
            <div
              key={entry._id}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      Day {entry.day}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Smile className="h-4 w-4" />
                      {entry.mood}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold mt-3 text-gray-800">
                    {entry.title}
                  </h2>
                </div>
                <span className="text-xs text-gray-500">
                  {/* {new Date(entry.createdAt).toLocaleDateString()} */}
                </span>
              </div>

              <p className="mt-3 text-gray-700 whitespace-pre-line">
                {entry.description}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                {entry.media && (
                  <a
                    href={`/uploads/${entry.media}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ImageIcon className="h-4 w-4" />
                    View Media
                  </a>
                )}
                {entry.reportPdf && (
                  <a
                    href={`/uploads/${entry.reportPdf}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="h-4 w-4" />
                    View Report
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
