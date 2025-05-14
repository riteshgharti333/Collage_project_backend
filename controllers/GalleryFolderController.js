import cloudinary from "../utils/cloudinary.js";
import { GalleryFolder } from "../models/galleryFolderModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import streamifier from "streamifier";
import mongoose from "mongoose";

// CREATE GALLERY FOLDER
export const createGalleryFolder = catchAsyncError(async (req, res, next) => {
  const { folderTitle } = req.body;

  if (
    !folderTitle ||
    !req.files ||
    !req.files.folderImage ||
    !req.files.galleryImages
  ) {
    throw new ErrorHandler(
      "Folder title, folder image, and gallery images are required!",
      400,
    );
  }

  const existingFolder = await GalleryFolder.findOne({ folderTitle });

  if (existingFolder) {
    throw new ErrorHandler("Folder title already exists!", 409);
  }

  let folderImageUrl;
  const galleryImages = [];

  // ✅ Upload Folder Image
  try {
    const folderResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `thenad_data/gallery_folder/${folderTitle}`,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      streamifier
        .createReadStream(req.files.folderImage[0].buffer)
        .pipe(stream);
    });

    folderImageUrl = folderResult.secure_url;
  } catch (error) {
    console.error("Cloudinary Folder Image Upload Error:", error);
    throw new ErrorHandler("Failed to upload folder image", 500);
  }

  // ✅ Upload Multiple Gallery Images
  try {
    const uploadPromises = req.files.galleryImages.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `thenad_data/gallery_folder/${folderTitle}/images`,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else
              resolve({
                imageUrl: result.secure_url,
                publicId: result.public_id,
              });
          },
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    galleryImages.push(...uploadedImages);
  } catch (error) {
    console.error("Cloudinary Gallery Image Upload Error:", error);
    throw new ErrorHandler("Failed to upload gallery images", 500);
  }

  // ✅ Save to MongoDB
  const galleryFolder = await GalleryFolder.create({
    folderImage: folderImageUrl,
    folderTitle,
    galleryImages,
  });

  res.status(201).json({
    result: 1,
    message: "Gallery folder created successfully",
    galleryFolder,
  });
});

// GET ALL Gallery Folders
export const getAllGalleryFolders = catchAsyncError(async (req, res, next) => {
  const folders = await GalleryFolder.find().sort({ createdAt: -1 });

  if (!folders || folders.length === 0) {
    throw new ErrorHandler("No gallery folders found!", 404);
  }

  res.status(200).json({
    result: 1,
    message: "Gallery folders fetched successfully",
    folders,
  });
});

// GET Single Gallery Folder by ID
export const getSingleGalleryFolder = catchAsyncError(
  async (req, res, next) => {
    const { id } = req.params;

    const folder = await GalleryFolder.findById(id);

    if (!folder) {
      throw new ErrorHandler("Gallery folder not found!", 404);
    }

    res.status(200).json({
      result: 1,
      message: "Gallery folder fetched successfully",
      folder,
    });
  },
);

// DELETE Gallery Folder and Images from Cloudinary
export const deleteGalleryFolder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // ✅ 1. Find the folder in MongoDB
  const folder = await GalleryFolder.findById(id);

  if (!folder) {
    throw new ErrorHandler("Gallery folder not found!", 404);
  }

  // ✅ 2. Extract Cloudinary folder path
  const folderPath = `thenad_data/gallery_folder/${folder.folderTitle}`;

  try {
    // ✅ 3. Delete all images in the folder
    await cloudinary.api.delete_resources_by_prefix(folderPath);

    // ✅ 4. Delete the empty folder itself
    await cloudinary.api.delete_folder(folderPath);

    // ✅ 5. Remove the folder from MongoDB
    await GalleryFolder.findByIdAndDelete(id);

    res.status(200).json({
      result: 1,
      message: "Gallery folder and all images deleted successfully",
    });
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    throw new ErrorHandler("Failed to delete Cloudinary folder", 500);
  }
});

/// UPDATE GALLERY FOLDER
export const updateGalleryFolder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const folder = await GalleryFolder.findById(id);
  if (!folder) {
    throw new ErrorHandler("Gallery folder not found!", 404);
  }

  // ✅ Handle `imagesToRemove` format properly
  let imagesToRemove = [];

  // FormData may send individual strings or an array
  if (req.body.imagesToRemove) {
    if (Array.isArray(req.body.imagesToRemove)) {
      imagesToRemove = req.body.imagesToRemove; // Array format
    } else if (typeof req.body.imagesToRemove === "string") {
      imagesToRemove = [req.body.imagesToRemove]; // Single image string converted to array
    }
  }

  // ✅ Remove images from Cloudinary
  if (imagesToRemove.length > 0) {
    const imageIdsToRemove = imagesToRemove.map((imgUrl) => {
      const publicId = imgUrl.split("/").pop().split(".")[0]; // Extract public ID
      return `thenad_data/gallery_folder/${folder.folderTitle}/images/${publicId}`;
    });

    // Remove images from Cloudinary
    await Promise.all(
      imageIdsToRemove.map((publicId) => cloudinary.uploader.destroy(publicId)),
    );

    // Remove from MongoDB
    folder.galleryImages = folder.galleryImages.filter(
      (img) => !imagesToRemove.includes(img.imageUrl),
    );
  }

  // ✅ Upload New Images
  if (req.files && req.files.galleryImages) {
    const uploadPromises = req.files.galleryImages.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `thenad_data/gallery_folder/${folder.folderTitle}/images`,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else
              resolve({
                imageUrl: result.secure_url,
                publicId: result.public_id,
              });
          },
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    folder.galleryImages.push(...uploadedImages);
  }

  await folder.save();

  res.status(200).json({
    result: 1,
    message: "Gallery images updated successfully",
    folder,
  });
});
