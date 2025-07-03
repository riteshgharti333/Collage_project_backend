import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Founder } from "../models/founderModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import mongoose from "mongoose";

// NEW FOUNDER
export const createFounder = catchAsyncError(async (req, res, next) => {
  const { name, position } = req.body;

  if (!name || !position || !req.file) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  let imageUrl;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "thenad_data/founder_images",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    imageUrl = result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new ErrorHandler("Failed to upload image to Cloudinary", 500);
  }

  const founder = await Founder.create({ name, position, image: imageUrl });

  res.status(201).json({
    result: 1,
    message: "Founding member created successfully",
    founder,
  });
});

// GET ALL FOUNDERS
export const getAllFounders = catchAsyncError(async (req, res, next) => {
  const founders = await Founder.find().sort({ order: 1 });

  res.status(200).json({
    result: 1,
    founders,
  });
});

// GET FOUNDER BY ID
export const getFounder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const founder = await Founder.findById(id);

  if (!founder) {
    throw new ErrorHandler("Founding member not found!", 404);
  }

  res.status(200).json({
    result: 1,
    founder,
  });
});

// UPDATE FOUNDER
export const updateFounder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const { name, position } = req.body;

  const founder = await Founder.findById(id);

  if (!founder) {
    throw new ErrorHandler("Founding member not found!", 404);
  }

  let imageUrl = founder.image;

  // ✅ Upload new image if provided
  if (req.file) {
    try {
      // 🔥 Destroy old image from Cloudinary
      const oldImagePublicId = founder.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `thenad_data/founder_images/${oldImagePublicId}`,
      );

      // 🔥 Upload new image using streamifier
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "thenad_data/founder_images",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      imageUrl = result.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new ErrorHandler("Failed to upload image to Cloudinary", 500);
    }
  }

  founder.name = name || founder.name;
  founder.position = position || founder.position;
  founder.image = imageUrl;

  await founder.save();

  res.status(200).json({
    result: 1,
    message: "Founding member updated successfully",
    founder,
  });
});

// DELETE FOUNDER
export const deleteFounder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid ID format!", 400);
  }

  const founder = await Founder.findById(id);

  if (!founder) {
    throw new ErrorHandler("Founding member not found!", 404);
  }

  const imageUrl = founder.image;

  if (imageUrl) {
    const publicId = imageUrl.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(`thenad_data/founder_images/${publicId}`);
  }

  await founder.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Founding member deleted successfully",
  });
});


// Reorder Mentor

export const reorderFounder = catchAsyncError(async (req, res, next) => {
  const { order } = req.body; 

  if (!Array.isArray(order)) {
    return res.status(400).json({ result: 0, message: "Invalid input" });
  }

  await Promise.all(
    order.map((id, index) =>
      Founder.findByIdAndUpdate(id, { order: index }, { new: true })
    )
  );

  res.status(200).json({ result: 1, message: "Mentor reordered successfully" });
})