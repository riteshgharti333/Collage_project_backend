import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { AffiliatedImage } from "../models/affiliatedModel.js";

import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import mongoose from "mongoose";

export const newAffiliated = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    throw new ErrorHandler("Affiliated image is required!", 400);
  }

  let imageUrl;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "thenad_data/affiliated_images",
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

  const affiliated = await AffiliatedImage.create({
    image: imageUrl,
  });

  res.status(201).json({
    result: 1,
    message: "affiliated image Album added successfully!",
    affiliated,
  });
});

// GET SINGLE affiliated

export const getSingleAffiliated = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const affiliated = await AffiliatedImage.findById(id);

  if (!affiliated) {
    return next(new ErrorHandler("affiliated image not found!", 404));
  }

  res.status(200).json({
     result: 1,
    affiliated,
  });
});

// GET All affiliated

export const getAllAffiliated = catchAsyncError(async (req, res, next) => {
  const affiliated = await AffiliatedImage.find();

  res.status(200).json({
     result: 1,
    affiliated,
  });
});

// DELETE affiliated

export const deleteAffiliated = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid ID format!", 400);
  }

  const affiliated = await AffiliatedImage.findById(id);

  if (!affiliated) {
    return next(new ErrorHandler("affiliated image not found!", 404));
  }

  const imageUrl = affiliated.image;
  if (imageUrl) {
    const publicId = imageUrl.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(
      `thenad_data/affiliated_images/${publicId}`
    );
  }

  await affiliated.deleteOne();

  res.status(200).json({
     result: 1,
    message: "affiliated image deleted successfully!",
  });
});
