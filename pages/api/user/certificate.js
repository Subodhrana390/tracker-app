import connectDB from "@/lib/mongodb";
import Certificate from "@/models/Certificate";
import jwt from "jsonwebtoken";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req) {
  const token = req.cookies?.token;

  if (!token) {
    throw new Error("No token provided");
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectDB();

  try {
    const decoded = await verifyToken(req);
    const userId = decoded.id;

    if (req.method === "GET") {
      const certificate = await Certificate.findOne({ userId }).sort({
        completionDate: -1,
      });

      if (!certificate) {
        return res.status(404).json({ error: "No certificate found" });
      }

      return res.status(200).json(certificate);
    }

    if (req.method === "POST") {
      const form = formidable();

      const { files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, _, files) => {
          if (err) return reject(err);
          resolve({ files });
        });
      });

      const file = Array.isArray(files.certificate)
        ? files.certificate[0]
        : files.certificate;

      if (!file) {
        return res.status(400).json({ error: "No certificate file uploaded" });
      }

      const filePath = file.filepath || file.path;

      if (!filePath) {
        return res.status(400).json({ error: "Uploaded file path not found" });
      }

      const buffer = await fs.readFile(filePath);
      const filename = `${Date.now()}-${file.originalFilename || file.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await fs.mkdir(uploadDir, { recursive: true });

      const finalPath = path.join(uploadDir, filename);

      await fs.writeFile(finalPath, buffer);

      // Check if certificate already exists for this user
      const existingCert = await Certificate.findOne({ userId });

      if (existingCert) {
        // Delete old file if exists
        if (existingCert.filePath) {
          try {
            const oldFilePath = path.join(
              process.cwd(),
              "public",
              existingCert.filePath
            );
            await fs.unlink(oldFilePath);
          } catch (unlinkErr) {
            console.warn("Failed to delete old certificate file:", unlinkErr);
          }
        }

        // Update existing document
        existingCert.filePath = `/uploads/${filename}`;
        existingCert.completionDate = new Date();
        existingCert.course = "Daily Diary Training";

        await existingCert.save();

        return res.status(200).json({ certificate: existingCert });
      }

      // No existing certificate - create new
      const cert = new Certificate({
        userId,
        filePath: `/uploads/${filename}`,
        course: "Daily Diary Training",
        completionDate: new Date(),
      });

      await cert.save();

      return res.status(201).json({ certificate: cert });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
