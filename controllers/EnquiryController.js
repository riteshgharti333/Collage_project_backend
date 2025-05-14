import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Enquiry } from "../models/enquiryModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Admission } from "../models/admissionModel.js";

// NEW Enquiry

export const createEnquiry = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    phoneNumber,
    profile,
    selectCourse,
    selectState,
    district,
    city,
    message,
  } = req.body;

  if (
    !name ||
    !email ||
    !phoneNumber ||
    !profile ||
    !selectCourse ||
    !selectState ||
    !district ||
    !city ||
    !message
  ) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  const enquiry = await Enquiry.create({
    name,
    email,
    phoneNumber,
    profile,
    selectCourse,
    selectState,
    district,
    city,
    message,
  });

  res.status(201).json({
    result: 1,
    message: "Enquiry created successfully",
    enquiry,
  });
});

// GET ALL Enquiry
export const getAllEnquiries = catchAsyncError(async (req, res, next) => {
  const enquiry = await Enquiry.find();

  if (!enquiry || enquiry.length === 0) {
    return next(new ErrorHandler("No enquiry found", 404));
  }

  res.status(200).json({
    result: 1,
    message: "Enquiry fetched successfully",
    count: enquiry.length,
    enquiry,
  });
});

// GET SINGLE Enquiry BY ID

export const getEnquiryById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const enquiry = await Enquiry.findById(id);

  if (!enquiry) {
    return next(new ErrorHandler("Enquiry not found", 404));
  }

  res.status(200).json({
    result: 1,
    message: "Enquiry fetched successfully",
    enquiry,
  });
});

// DELETE Enquiry BY ID

export const deleteEnquiry = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const enquiry = await Enquiry.findById(id);

  if (!enquiry) {
    return next(new ErrorHandler("Enquiry not found", 404));
  }

  await enquiry.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Enquiry deleted successfully",
  });
});

// ✅ Approve Enquiry & Add to Admission
export const approveEnquiry = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const enquiry = await Enquiry.findById(id);

  if (!enquiry) {
    return next(new ErrorHandler("Enquiry not found", 404));
  }

  if (enquiry.approved) {
    return res.status(400).json({
      result: 0,
      message: "Enquiry is already approved and added to admission data",
    });
  }

  const newAdmission = await Admission.create({
    name: enquiry.name,
    email: enquiry.email,
    phoneNumber: enquiry.phoneNumber,
    profile: enquiry.profile,
    selectCourse: enquiry.selectCourse,
    selectState: enquiry.selectState,
    district: enquiry.district,
    city: enquiry.city,
    message: enquiry.message,
    approved: false,
  });

  enquiry.approved = true;
  await enquiry.save();

  res.status(200).json({
    result: 1,
    message: "Enquiry added to admission successfully with approved: false",
    admission: newAdmission,
  });
});
