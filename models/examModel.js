import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      uppercase: true,
      trim: true,
      unique: true
    },
    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: [0, "Marks cannot be negative"],
    },
  },
  {
    timestamps: true, 
  }
);

export const Exam = mongoose.model("Exam", examSchema);
