import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
  },
  obtainedMarks: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
});

const marksheetSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subjects: [subjectSchema],
    totalMaxMarks: {
      type: Number,
      required: true,
    },
    totalObtainedMarks: {
      type: Number,
      required: true,
    },
    overallGrade: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Marksheet = mongoose.model("Marksheet", marksheetSchema);
export default Marksheet;
