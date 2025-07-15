import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req) {
  const token = req.cookies.token;
  return jwt.verify(token, JWT_SECRET);
}

export default async function handler(req, res) {
  await connectDB();

  try {
    const decoded = await verifyToken(req);
    const userId = decoded.id;

    if (req.method === "GET") {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ user });
    }

    if (req.method === "POST") {
      const { name, crn, urn, email, profilePic } = req.body;

      if (
        !name ||
        typeof name !== "string" ||
        !crn ||
        typeof crn !== "string" ||
        !urn ||
        typeof urn !== "string" ||
        !email ||
        typeof email !== "string"
      ) {
        return res
          .status(400)
          .json({ error: "Missing or invalid required fields" });
      }

      const updateFields = { name, crn, urn, email };
      if (profilePic && typeof profilePic === "string") {
        updateFields.profilePic = profilePic;
      }

      const user = await User.findOneAndUpdate({ _id: userId }, updateFields, {
        new: true,
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ user });
    }
    if (req.method === "POST") {
      const body = await req.json?.();
      if (!body) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }

      const { name, crn, urn, email } = body;

      if (
        !name ||
        typeof name !== "string" ||
        !crn ||
        typeof crn !== "string" ||
        !urn ||
        typeof urn !== "string" ||
        !email ||
        typeof email !== "string"
      ) {
        return res
          .status(400)
          .json({ error: "Missing or invalid required fields" });
      }

      const user = await User.findOneAndUpdate(
        { _id: userId },
        { name, crn, urn, email },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ user });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(401).json({ error: error.message || "Unauthorized" });
  }
}
