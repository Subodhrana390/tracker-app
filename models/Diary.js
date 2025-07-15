import mongoose from "mongoose";

const diarySchema = new mongoose.Schema({
  title: String,
  description: String,
  mood: String,
  day: Number,
  media: String,
  reportPdf: String,
  userId: mongoose.Schema.Types.ObjectId,
});

export default mongoose.models.Diary || mongoose.model("Diary", diarySchema);
