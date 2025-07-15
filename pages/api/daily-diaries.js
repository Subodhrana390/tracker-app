import connectDB from "@/lib/mongodb";
import Diary from "@/models/Diary";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const diaries = await Diary.find({ userId }).sort({ day: 1 });
    res.status(200).json(diaries);
  } catch {
    res.status(500).json({ error: "Failed to fetch diaries" });
  }
}
