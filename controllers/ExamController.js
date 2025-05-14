import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Exam } from "../models/examModel.js";

// CREATE EXAM
export const createExam = catchAsyncError(async (req, res, next) => {
  const { courseName, courseCode, marks } = req.body;

  if (!courseName || !courseCode || marks === undefined) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  const existingExam = await Exam.findOne({ courseCode });

  if (existingExam) {
    throw new ErrorHandler("Course code already exists!", 400);
  }

  const exam = await Exam.create({ courseName, courseCode, marks });

  res.status(201).json({
    result: 1,
    message: "Exam record created successfully",
    exam,
  });
});

// GET ALL EXAMS
export const getAllExams = catchAsyncError(async (req, res, next) => {
  const exams = await Exam.find().sort({ createdAt: -1 });

  res.status(200).json({
    result: 1,
    exams,
  });
});

// GET SINGLE EXAM BY ID
export const getExamById = catchAsyncError(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new ErrorHandler("Exam not found", 404);
  }

  res.status(200).json({
    result: 1,
    exam,
  });
});

// UPDATE EXAM
export const updateExam = catchAsyncError(async (req, res, next) => {
  const { courseName, courseCode, marks } = req.body;

  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new ErrorHandler("Exam not found", 404);
  }

  if (courseName !== undefined) exam.courseName = courseName;
  if (courseCode !== undefined) exam.courseCode = courseCode;
  if (marks !== undefined) exam.marks = marks;

  await exam.save();

  res.status(200).json({
    result: 1,
    message: "Exam updated successfully",
    exam,
  });
});

// DELETE EXAM
export const deleteExam = catchAsyncError(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new ErrorHandler("Exam not found", 404);
  }

  await exam.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Exam deleted successfully",
  });
});


/////////////// search course

export const searchCourse = catchAsyncError(async (req, res, next) => {
  const { keyword } = req.query;

  if (!keyword || keyword.trim() === "") {
    return res.status(200).json({ result: 1, courses: [] });
  }

  const regex = new RegExp(keyword, "i"); 

  const courses = await Exam.find({
    $or: [{ courseCode: regex }, { courseName: regex }],
  });

  
  if (courses.length === 0) {
    return res.status(404).json({
      result: 0,
      message: "No courses found with that name",
    });
  }

  res.status(200).json({
    result: 1,
    courses,
  });
});