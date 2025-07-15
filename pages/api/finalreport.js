import formidable from "formidable";
import fs from "fs";
import path from "path";
import connectDB from "@/lib/mongodb";
import FinalReport from "@/models/FinalReport";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  await connectDB();

  if (req.method === "GET") {
    try {
      const reports = await FinalReport.find({
        userId: decoded.id,
      }).sort({ createdAt: -1 });

      console.log("Fetched reports:", reports);
      return res.status(200).json(reports);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch reports" });
    }
  }

  if (req.method === "POST") {
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "final-reports"
    );
    fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      multiples: false,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "Error processing file" });
      }

      const title = fields.title?.[0] || fields.title;
      const description = fields.description?.[0] || "";
      const file = files.report[0];

      if (!title || !file) {
        return res.status(400).json({ error: "Missing title or report file" });
      }

      const fileName = path.basename(file.filepath);
      const filePath = `/uploads/final-reports/${fileName}`;

      try {
        const report = new FinalReport({
          userId: decoded.id || decoded.userId,
          title,
          description,
          reportPath: filePath,
        });

        await report.save();
        return res.status(201).json({ success: true, report });
      } catch (error) {
        console.error("Error saving report:", error);
        return res.status(500).json({ error: "Failed to save report" });
      }
    });
  }
}
