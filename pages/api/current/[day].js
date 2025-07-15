import connectDB from "@/lib/mongodb";
import Diary from "@/models/Diary";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req) {
  const token = req.cookies.token;
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.id;
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let userId;
  try {
    userId = await verifyToken(req);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or missing token" });
  }

  const { day } = req.query;

  if (!day) {
    return res.status(400).json({ error: "Day parameter is required" });
  }

  const dayNumber = parseInt(day, 10);
  if (isNaN(dayNumber)) {
    return res.status(400).json({ error: "Day must be a number" });
  }

  try {
    const diaryEntry = await Diary.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      day: dayNumber,
    });

    if (!diaryEntry) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    return res.status(200).json(diaryEntry);
  } catch (error) {
    console.error("Error fetching diary entry:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
