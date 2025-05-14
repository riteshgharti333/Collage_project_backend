import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    certificateNo: { type: String, required: true },
    enrollmentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    course: { type: String, required: true },
    duration: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
