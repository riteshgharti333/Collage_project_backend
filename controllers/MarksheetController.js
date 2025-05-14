import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Marksheet from "../models/marksheetModel.js";
import Student from "../models/studentModel.js";

// CREATE MARKSHEET
export const createMarksheet = catchAsyncError(async (req, res, next) => {
  const {
    studentId,
    subjects,
    totalMaxMarks,
    totalObtainedMarks,
    overallGrade,
  } = req.body;

  if (!studentId || !Array.isArray(subjects) || totalMaxMarks == null || totalObtainedMarks == null || !overallGrade) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  if (subjects.length === 0) {
    throw new ErrorHandler("At least one subject must be provided.", 400);
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ErrorHandler("Student not found.", 404);
  }

  const marksheet = await Marksheet.create({
    student: studentId,
    subjects,
    totalMaxMarks,
    totalObtainedMarks,
    overallGrade,
  });

  res.status(201).json({
    result: 1,
    message: "Marksheet created successfully",
    marksheet,
  });
});

// GET ALL MARKSHEETS
export const getAllMarksheets = catchAsyncError(async (req, res) => {
  const marksheets = await Marksheet.find().populate("student");

  res.status(200).json({
    result: 1,
    marksheets,
  });
});

// GET SINGLE MARKSHEET
export const getSingleMarksheet = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const marksheet = await Marksheet.findById(id).populate("student");

  if (!marksheet) {
    throw new ErrorHandler("Marksheet not found", 404);
  }

  res.status(200).json({
    result: 1,
    marksheet,
  });
});

// UPDATE MARKSHEET
export const updateMarksheet = catchAsyncError(async (req, res, next) => {
  const {
    studentId,
    subjects,
    totalMaxMarks,
    totalObtainedMarks,
    overallGrade,
  } = req.body;

  const { id } = req.params;

  const marksheet = await Marksheet.findById(id);
  if (!marksheet) {
    throw new ErrorHandler("Marksheet not found", 404);
  }

  if (!Array.isArray(subjects) || totalMaxMarks == null || totalObtainedMarks == null || !overallGrade) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  if (subjects.length === 0) {
    throw new ErrorHandler("At least one subject must be provided.", 400);
  }

  
  marksheet.subjects = subjects;
  marksheet.totalMaxMarks = totalMaxMarks;
  marksheet.totalObtainedMarks = totalObtainedMarks;
  marksheet.overallGrade = overallGrade;

  await marksheet.save();

  res.status(200).json({
    result: 1,
    message: "Marksheet updated successfully",
    marksheet,
  });
});

// DELETE MARKSHEET
export const deleteMarksheet = catchAsyncError(async (req, res, next) => {
  console.log("hello")

  const { id } = req.params;

  const marksheet = await Marksheet.findById(id);
  if (!marksheet) {
    throw new ErrorHandler("Marksheet not found", 404);
  }

  await marksheet.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Marksheet deleted successfully",
  });
});
