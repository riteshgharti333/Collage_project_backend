import { HomeContentDetails } from "../models/homeContentDetailsModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

// CREATE home content (only one)
export const createHomeContentDetails = catchAsyncError(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ErrorHandler("Title and description are required!", 400);
  }

  const existing = await HomeContentDetails.findOne();
  if (existing) {
    throw new ErrorHandler("Home content already exists. Use update instead.", 400);
  }

  const content = await HomeContentDetails.create({ title, description });

  res.status(201).json({
    success: true,
    message: "Home content created successfully",
    content,
  });
});

// GET the only one home content
export const getHomeContentDetails = catchAsyncError(async (req, res, next) => {
  const content = await HomeContentDetails.findOne();

  if (!content) {
    throw new ErrorHandler("Home content not found", 404);
  }

  res.status(200).json({
    success: true,
    content,
  });
});

// UPDATE the only one home content
export const updateHomeContentDetails = catchAsyncError(async (req, res, next) => {
  const { title, description } = req.body;

  const content = await HomeContentDetails.findOne();
  if (!content) {
    throw new ErrorHandler("No existing home content to update", 404);
  }

  if (title) content.title = title;
  if (description) content.description = description;

  await content.save();

  res.status(200).json({
    success: true,
    message: "Home content updated successfully",
    content,
  });
});
