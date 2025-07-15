import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

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

    const id = normalizeField(fields.id); // optional, for update
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

    let reportPath = null;
    // If new file is uploaded, save it
    if (uploadedFile) {
      if (uploadedFile.mimetype !== "application/pdf") {
        return res
          .status(400)
          .json({ error: "A valid PDF project report is required" });
      }

      const buffer = await fs.readFile(
        uploadedFile.filepath || uploadedFile.path
      );
      const filename = `${Date.now()}-${
        uploadedFile.originalFilename || uploadedFile.name
      }`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await fs.mkdir(uploadDir, { recursive: true });
      const finalPath = path.join(uploadDir, filename);
      await fs.writeFile(finalPath, buffer);

      reportPath = `/uploads/${filename}`;
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

        if (reportPath) {
          // Delete old file if exists
          if (project.reportPath) {
            const oldFilePath = path.join(
              process.cwd(),
              "public",
              project.reportPath
            );
            try {
              await fs.unlink(oldFilePath);
            } catch (err) {
              console.warn("Old file deletion error:", err.message);
            }
          }
          project.reportPath = reportPath;
        }

        await project.save();
        return res.status(200).json({ project });
      } else {
        // Create new project
        if (!reportPath) {
          return res.status(400).json({
            error: "A PDF project report is required for new project",
          });
        }

        const project = new Project({
          userId,
          title,
          description,
          link,
          reportPath,
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

      // Delete file from disk if exists
      if (project.reportPath) {
        const filePath = path.join(process.cwd(), "public", project.reportPath);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.warn("File already deleted or not found:", err.message);
        }
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
