import connectDB from "@/lib/mongodb";
import Diary from "@/models/Diary";
import path from "path";
import jwt from "jsonwebtoken";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({
      keepExtensions: true,
      uploadDir: path.join(process.cwd(), "public", "uploads"),
      filename: (name, ext, part) => `${Date.now()}-${part.originalFilename}`,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

const authenticate = (req) => {
  const token = req.cookies.token;
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const userId = authenticate(req);
    const { fields, files } = await parseForm(req);

    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const description = Array.isArray(fields.description)
      ? fields.description[0]
      : fields.description;
    const mood = Array.isArray(fields.mood) ? fields.mood[0] : fields.mood;
    const dayRaw = Array.isArray(fields.day) ? fields.day[0] : fields.day;
    const day = Number(dayRaw);
    if (isNaN(day)) {
      return res.status(400).json({ error: "Invalid day number" });
    }

    let mediaPath = null;
    const mediaFile = files.media;
    if (mediaFile) {
      const file = Array.isArray(mediaFile) ? mediaFile[0] : mediaFile;
      mediaPath = path.relative(
        path.join(process.cwd(), "public"),
        file.filepath || file.path
      );
    }

    let reportPdfPath = null;
    const reportFile = files.report;
    if (reportFile) {
      const file = Array.isArray(reportFile) ? reportFile[0] : reportFile;
      reportPdfPath = path.relative(
        path.join(process.cwd(), "public"),
        file.filepath || file.path
      );
    }

    // Build update object
    const updateData = {
      title,
      description,
      mood,
      day,
      userId,
    };

    if (mediaPath) updateData.media = mediaPath;
    if (reportPdfPath) updateData.reportPdf = reportPdfPath;

    const updatedEntry = await Diary.findOneAndUpdate(
      { userId, day },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(updatedEntry);
  } catch (err) {
    console.error("POST error:", err);
    return res
      .status(500)
      .json({ error: "Failed to create or update diary entry" });
  }
}
