import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost/daily_diary",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
};

export default connectDB;
