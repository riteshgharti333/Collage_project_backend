import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import About from "../models/aboutModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// CREATE or UPDATE ABOUT
export const createOrUpdateAbout = catchAsyncError(async (req, res, next) => {
  const { content } = req.body;

  if (!Array.isArray(content) || content.length === 0) {
    throw new ErrorHandler(
      "Content must be a non-empty array of paragraphs.",
      400
    );
  }

  let about = await About.findOne();

  if (about) {
    about.content = content;
    await about.save();

    return res.status(200).json({
      result: 1,
      message: "About content updated successfully",
      about,
    });
  }

  about = await About.create({ content });

  res.status(201).json({
    result: 1,
    message: "About content created successfully",
    about,
  });
});

// GET ABOUT
export const getAbout = catchAsyncError(async (req, res, next) => {
  const about = await About.findOne();

  if (!about) {
    throw new ErrorHandler("About content not found", 404);
  }

  res.status(200).json({
    result: 1,
    about,
  });
});
