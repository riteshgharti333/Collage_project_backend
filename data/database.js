import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB Connection Successful!");
    return true;
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
    throw error;
  }
};
