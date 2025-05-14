import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Student from "../models/studentModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create a Student
export const createStudent = catchAsyncError(async (req, res, next) => {
  const {
    certificateNo,
    enrollmentId,
    name,
    fatherName,
    course,
    duration,
    date,
  } = req.body;

  if (
    !certificateNo ||
    !enrollmentId ||
    !name ||
    !fatherName ||
    !course ||
    !duration ||
    !date
  ) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  try {
    const student = await Student.create({
      certificateNo,
      enrollmentId,
      name,
      fatherName,
      course,
      duration,
      date,
    });

    res.status(201).json({
      result: 1,
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ErrorHandler(
        `Student with enrollment ID "${enrollmentId}" already exists!`,
        409
      );
    }

    throw new ErrorHandler("Failed to create student", 500);
  }
});

// Get All Students
export const getAllStudents = catchAsyncError(async (req, res) => {
  const students = await Student.find();

  res.status(200).json({
    result: 1,
    students,
  });
});

// Get Single Student by ID
export const getStudentById = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    throw new ErrorHandler("Student not found", 404);
  }

  res.status(200).json({
    result: 1,
    student,
  });
});

// Update Student
export const updateStudent = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    throw new ErrorHandler("Student not found", 404);
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    result: 1,
    message: "Student updated successfully",
    student: updatedStudent,
  });
});

// Delete Student
export const deleteStudent = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    throw new ErrorHandler("Student not found", 404);
  }

  await student.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Student deleted successfully",
  });
});

//////////// Search Student

export const searchStudents = catchAsyncError(async (req, res, next) => {
  const { keyword } = req.query;

  if (!keyword || keyword.trim() === "") {
    return res.status(200).json({ result: 1, students: [] });
  }

  const regex = new RegExp(keyword, "i"); 

  const students = await Student.find({
    $or: [{ name: regex }, { fatherName: regex }],
  });

  
  if (students.length === 0) {
    return res.status(404).json({
      result: 0,
      message: "No students found with that name",
    });
  }

  res.status(200).json({
    result: 1,
    students,
  });
});

