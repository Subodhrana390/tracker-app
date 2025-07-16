import connectDB from "@/lib/mongodb";
import FinalReport from "@/models/FinalReport";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const report = await FinalReport.findOne({ userId });
    if (!report) {
      return res.status(200).json({ submitted: false });
    }

    res.status(200).json({
      submitted: true,
      title: report.title,
      description: report.description,
      reportPath: report.reportPath,
      submittedAt: report.submittedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
