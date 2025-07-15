import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  userId: String,
  filePath: String,
  course: String,
  completionDate: Date,
});

export default mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);
