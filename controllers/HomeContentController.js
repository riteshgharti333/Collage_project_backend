import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { HomeContent } from "../models/homeContentModel.js";

import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import mongoose from "mongoose";

export const newHomeContent = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    throw new ErrorHandler("Home content image is required!", 400);
  }

  let imageUrl;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "thenad_data/homeContent_images",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    imageUrl = result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new ErrorHandler("Failed to upload image to Cloudinary", 500);
  }

  const homeContent = await HomeContent.create({
    image: imageUrl,
  });

  res.status(201).json({
    result: 1,
    message: "Home content image added successfully!",
    homeContent,
  });
});

// GET SINGLE Home Content

export const getSingleHomeContent = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const homeContent = await HomeContent.findById(id);

  if (!homeContent) {
    return next(new ErrorHandler("Home content image not found!", 404));
  }

  res.status(200).json({
    result: 1,
    homeContent,
  });
});

// GET All Home Content

export const getAllHomeContent = catchAsyncError(async (req, res, next) => {
  const homeContent = await HomeContent.find();

  res.status(200).json({
    result: 1,
    homeContent,
  });
});

export const updateHomeContent = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const homeContent = await HomeContent.findById(id);

  if (!homeContent) {
    throw new ErrorHandler("Home content image not found!", 404);
  }

  let imageUrl = homeContent.image;

  if (req.file) {
    try {
      const oldImagePublicId = homeContent.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `thenad_data/homeContent_images/${oldImagePublicId}`
      );

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "thenad_data/homeContent_images",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      imageUrl = result.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new ErrorHandler("Failed to upload image to Cloudinary", 500);
    }
  }

  homeContent.image = imageUrl;

  await homeContent.save();

  res.status(200).json({
    result: 1,
    message: "Home content image updated successfully",
    homeContent,
  });
});


// DELETE Home Content

export const deleteHomeContent = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid ID format!", 400);
  }

  const homeContent = await HomeContent.findById(id);

  if (!homeContent) {
    throw new ErrorHandler("Home content image not found!", 404);
  }

  const imageUrl = homeContent.image;
  if (imageUrl) {
    const publicId = imageUrl.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(`thenad_data/homeContent_images/${publicId}`);
  }

  await homeContent.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Home content image deleted successfully!",
  });
});
