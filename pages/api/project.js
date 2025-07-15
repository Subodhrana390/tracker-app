import formidable from "formidable";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import { v2 as cloudinary } from "cloudinary";

const JWT_SECRET = process.env.JWT_SECRET;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

function normalizeField(field) {
  return Array.isArray(field) ? field[0] : field;
}

async function verifyToken(req) {
  const token = req.cookies.token;
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.id;
}

async function uploadToCloudinary(file) {
  return await cloudinary.uploader.upload(file.filepath || file.path, {
    resource_type: "raw", // for PDFs use "raw"
    folder: "projects/reports",
  });
}

async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (err) {
    console.warn("Cloudinary deletion error:", err.message);
  }
}

export default async function handler(req, res) {
  await connectDB();

  let userId;
  try {
    userId = await verifyToken(req);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or missing token" });
  }

  // GET: Fetch all user projects
  if (req.method === "GET") {
    try {
      const projects = await Project.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json(projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
  }

  // POST: Create or update project
  if (req.method === "POST") {
    const form = formidable({ multiples: false });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const id = normalizeField(fields.id);
    const title = normalizeField(fields.title);
    const description = normalizeField(fields.description);
    const link = normalizeField(fields.link);
    const file = files.projectReport;
    const uploadedFile = Array.isArray(file) ? file[0] : file;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    // Validate PDF
    if (uploadedFile && uploadedFile.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ error: "A valid PDF project report is required" });
    }

    let reportUrl = null;
    let reportPublicId = null;

    if (uploadedFile) {
      // Upload PDF to Cloudinary
      const uploadResult = await uploadToCloudinary(uploadedFile);
      reportUrl = uploadResult.secure_url;
      reportPublicId = uploadResult.public_id;
    }

    try {
      if (id) {
        // Update existing project
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        project.title = title;
        project.description = description;
        project.link = link;

        if (reportUrl) {
          // Delete old file from Cloudinary if exists
          if (project.reportPublicId) {
            await deleteFromCloudinary(project.reportPublicId);
          }
          project.reportUrl = reportUrl;
          project.reportPublicId = reportPublicId;
        }

        await project.save();
        return res.status(200).json({ project });
      } else {
        // Create new project
        if (!reportUrl) {
          return res.status(400).json({
            error: "A PDF project report is required for new project",
          });
        }

        const project = new Project({
          userId,
          title,
          description,
          link,
          reportUrl,
          reportPublicId,
        });

        await project.save();
        return res.status(200).json({ project });
      }
    } catch (err) {
      console.error("Save error:", err);
      return res.status(500).json({ error: "Failed to save project" });
    }
  }

  // DELETE: Remove a project (expects ?id=PROJECT_ID)
  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    try {
      const project = await Project.findOneAndDelete({ _id: id, userId });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Delete file from Cloudinary if exists
      if (project.reportPublicId) {
        await deleteFromCloudinary(project.reportPublicId);
      }

      return res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Failed to delete project" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
