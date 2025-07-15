import formidable from "formidable";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const config = {
  api: {
    bodyParser: false,
  },
};

const JWT_SECRET = process.env.JWT_SECRET;
const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

async function verifyToken(req) {
  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await connectDB();

  let userData;
  try {
    userData = await verifyToken(req); // Extract user data from token
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filename: (name, ext, part) => {
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "File upload error" });
    }

    const file = files.profilePic;
    if (!file) {
      return res.status(400).json({ error: "No profile picture provided" });
    }

    const fileUrl = `/uploads/${path.basename(file[0].filepath)}`;

    try {
      const user = await User.findByIdAndUpdate(
        userData.id,
        { profilePic: fileUrl },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ url: fileUrl, user });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
