import connectDB from "@/lib/mongodb";
import Certificate from "@/models/Certificate";
import jwt from "jsonwebtoken";
import formidable from "formidable";
import cloudinary from "@/lib/cloudinary";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req) {
  const token = req.cookies?.token;
  if (!token) throw new Error("No token provided");

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
      const form = formidable({ keepExtensions: true });

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

      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "certificates",
        resource_type: "auto",
        public_id: `cert-${userId}-${Date.now()}`,
      });

      const existingCert = await Certificate.findOne({ userId });

      if (existingCert) {
        existingCert.filePath = result.secure_url;
        existingCert.completionDate = new Date();
        existingCert.course = "TR-102 Industrial Training";
        await existingCert.save();

        return res.status(200).json({ certificate: existingCert });
      }

      // Create new certificate
      const cert = new Certificate({
        userId,
        filePath: result.secure_url,
        course: "TR-102 Industrial Training",
        completionDate: new Date(),
      });

      await cert.save();

      return res.status(201).json({ certificate: cert });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("Certificate API error:", error);
    return res.status(500).json({ error: error.message || "Server Error" });
  }
}
