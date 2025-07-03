import cloudinary from "../utils/cloudinary.js";
import { Staff } from "../models/staffModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import streamifier from "streamifier";
import mongoose from "mongoose";

// NEW STAFF
export const createStaff = catchAsyncError(async (req, res, next) => {
  const { name, position, location } = req.body;

  if (!name || !position || !location || !req.file) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  let imageUrl;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "thenad_data/staff_images",
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

  const staff = await Staff.create({
    name,
    position,
    location,
    image: imageUrl,
  });

  res.status(201).json({
    result: 1,
    message: "Staff member created successfully",
    staff,
  });
});

//  GET ALL STAFF
export const getAllStaff = catchAsyncError(async (req, res, next) => {
  const staff = await Staff.find().sort({ order: 1 });

  res.status(200).json({
    result: 1,
    staff,
  });
});

//  GET SINGLE STAFF BY ID
export const getSingleStaff = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const staff = await Staff.findById(id);

  if (!staff) {
    throw new ErrorHandler("Staff member not found!", 404);
  }

  res.status(200).json({
    result: 1,
    message: "Staff member fetched successfully",
    staff,
  });
});

//  UPDATE STAFF
export const updateStaff = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, position, location } = req.body;

  const staff = await Staff.findById(id);

  if (!staff) {
    throw new ErrorHandler("Staff member not found!", 404);
  }

  let imageUrl = staff.image;

  if (req.file) {
    try {
      // 🔥 Destroy old image from Cloudinary
      const oldImagePublicId = staff.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `thenad_data/staff_images/${oldImagePublicId}`
      );

      // 🔥 Upload new image using streamifier
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "thenad_data/staff_images",
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

  // ✅ Update staff fields
  staff.name = name || staff.name;
  staff.position = position || staff.position;
  staff.location = location || staff.location;
  staff.image = imageUrl;

  await staff.save();

  res.status(200).json({
    result: 1,
    message: "Staff member updated successfully",
    staff,
  });
});

// DELETE STAFF

export const deleteStaff = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid ID format!", 400);
  }

  const staff = await Staff.findById(id);

  if (!staff) {
    throw new ErrorHandler("Staff member not found!", 404);
  }

  const imageUrl = staff.image;
  if (imageUrl) {
    const publicId = imageUrl.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(`thenad_data/staff_images/${publicId}`);
  }

  await staff.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Staff member deleted successfully!",
  });
});

// Reorder Staff

export const reorderStaff = catchAsyncError(async (req, res, next) => {
  const { order } = req.body; 

  if (!Array.isArray(order)) {
    return res.status(400).json({ result: 0, message: "Invalid input" });
  }

  await Promise.all(
    order.map((id, index) =>
      Staff.findByIdAndUpdate(id, { order: index }, { new: true })
    )
  );

  res.status(200).json({ result: 1, message: "Staff reordered successfully" });
});
