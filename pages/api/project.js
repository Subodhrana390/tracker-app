import formidable from "formidable";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import cloudinary from "@/lib/cloudinary";

const JWT_SECRET = process.env.JWT_SECRET;

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
    resource_type: "auto",
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

  if (req.method === "GET") {
    try {
      const projects = await Project.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json(projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
  }

  if (req.method === "POST") {
    const form = formidable({ multiples: false });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

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

    if (!uploadedFile || uploadedFile.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ error: "A valid PDF project report is required" });
    }

    const uploadResult = await uploadToCloudinary(uploadedFile);
    const reportPath = uploadResult.secure_url;
    const reportPublicId = uploadResult.public_id;

    try {
      const project = new Project({
        userId,
        title,
        description,
        link,
        reportPath,
        reportPublicId,
      });

      await project.save();
      return res.status(200).json(project);
    } catch (err) {
      console.error("Save error:", err);
      return res.status(500).json({ error: "Failed to save project" });
    }
  }

  if (req.method === "PUT") {
    const form = formidable({ multiples: false });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const id = req.query.id;
    const title = normalizeField(fields.title);
    const description = normalizeField(fields.description);
    const link = normalizeField(fields.link);
    const file = files.projectReport;
    const uploadedFile = Array.isArray(file) ? file[0] : file;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Project ID is required for update" });
    }

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    if (uploadedFile && uploadedFile.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ error: "A valid PDF project report is required" });
    }

    let reportPath = null;
    let reportPublicId = null;

    if (uploadedFile) {
      const uploadResult = await uploadToCloudinary(uploadedFile);
      reportPath = uploadResult.secure_url;
      reportPublicId = uploadResult.public_id;
    }

    try {
      const project = await Project.findOne({ _id: id, userId });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      project.title = title;
      project.description = description;
      project.link = link;

      if (reportPath) {
        if (project.reportPublicId) {
          await deleteFromCloudinary(project.reportPublicId);
        }
        project.reportPath = reportPath;
        project.reportPublicId = reportPublicId;
      }

      await project.save();

      return res.status(200).json(project);
    } catch (err) {
      console.error("Update error:", err);
      return res.status(500).json({ error: "Failed to update project" });
    }
  }

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

      if (project.reportPublicId) {
        await deleteFromCloudinary(project.reportPublicId);
      }

      return res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Failed to delete project" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
