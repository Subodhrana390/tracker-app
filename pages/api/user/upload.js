import formidable from "formidable";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// Disable body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req) {
  const token = req.cookies.token;
  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

function parseForm(req) {
  const form = formidable({ keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();
    const userData = await verifyToken(req);

    const { fields, files } = await parseForm(req);
    const file = files.profilePic?.[0];

    if (!file) {
      return res.status(400).json({ error: "No profile picture provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: "tracker",
      public_id: `user-${userData.id}-${Date.now()}`,
    });

    // Save Cloudinary URL to DB
    const user = await User.findByIdAndUpdate(
      userData.id,
      { profilePic: result.secure_url },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ url: result.secure_url, user });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
