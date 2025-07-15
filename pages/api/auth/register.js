import formidable from "formidable";
import path from "path";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to extract first value from Formidable fields
const getFieldValue = (field) => (Array.isArray(field) ? field[0] : field);

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  await connectDB();

  try {
    const { fields, files } = await parseForm(req);

    // Extract and sanitize form fields
    const name = getFieldValue(fields.name);
    const email = getFieldValue(fields.email);
    const password = getFieldValue(fields.password);
    const crn = getFieldValue(fields.crn);
    const urn = getFieldValue(fields.urn);

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePicUrl = "";

    // Upload to Cloudinary
    const profilePic = files.profilePic?.[0];
    if (profilePic && profilePic.filepath) {
      const result = await cloudinary.uploader.upload(profilePic.filepath, {
        folder: "tracker",
        public_id: `${Date.now()}_${
          path.parse(profilePic.originalFilename).name
        }`,
      });
      profilePicUrl = result.secure_url;
    }

    // Create and save user
    const newUser = new User({
      name,
      email,
      crn,
      urn,
      password: hashedPassword,
      profilePic: profilePicUrl,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      user: {
        name: newUser.name,
        email: newUser.email,
        crn: newUser.crn,
        urn: newUser.urn,
        profilePic: newUser.profilePic,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
