import formidable from "formidable";
import connectDB from "@/lib/mongodb";
import FinalReport from "@/models/FinalReport";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";

const JWT_SECRET = process.env.JWT_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function uploadToCloudinary(file) {
  return cloudinary.uploader.upload(file.filepath || file.path, {
    resource_type: "auto",
    folder: "tracker/final-reports",
  });
}

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

      return res.status(200).json(reports);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch reports" });
    }
  }

  if (req.method === "POST") {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "Error processing file" });
      }

      const title = Array.isArray(fields.title)
        ? fields.title[0]
        : fields.title;
      const description = Array.isArray(fields.description)
        ? fields.description[0]
        : fields.description || "";

      const file = files.report
        ? Array.isArray(files.report)
          ? files.report[0]
          : files.report
        : null;

      if (!title || !file) {
        return res.status(400).json({ error: "Missing title or report file" });
      }

      try {
        let report = await FinalReport.findOne({ userId: decoded.id });

        const uploadResult = await uploadToCloudinary(file);

        if (report) {
          // Delete old file from Cloudinary if available
          if (report.reportPublicId) {
            try {
              await cloudinary.uploader.destroy(report.reportPublicId, {
                resource_type: "raw",
              });
            } catch (cloudErr) {
              console.warn(
                "Failed to delete old report from Cloudinary:",
                cloudErr
              );
            }
          }

          // Update existing report
          report.title = title;
          report.description = description;
          report.reportPath = uploadResult.secure_url;
          report.reportPublicId = uploadResult.public_id;
          await report.save();
        } else {
          // Create new report
          report = new FinalReport({
            userId: decoded.id,
            title,
            description,
            reportPath: uploadResult.secure_url,
            reportPublicId: uploadResult.public_id,
          });
          await report.save();
        }

        return res.status(201).json({ success: true, report });
      } catch (uploadError) {
        console.error("Cloudinary upload or DB save error:", uploadError);
        return res
          .status(500)
          .json({ error: "Failed to upload and save report" });
      }
    });
  }
}
