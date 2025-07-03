import cloudinary from "../utils/cloudinary.js";
import { GalleryFolder } from "../models/galleryFolderModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import streamifier from "streamifier";
import mongoose from "mongoose";

const GALLERY_IMAGES_FOLDER = "thenad_data/gallery_images";

// CREATE GALLERY FOLDER
export const createGalleryFolder = catchAsyncError(async (req, res, next) => {
  const { folderTitle } = req.body;

  if (!folderTitle) {
    throw new ErrorHandler(
      "Folder title, folder image, and gallery images are required!",
      400
    );
  }

  if (!req.files?.folderImage) {
    throw new ErrorHandler("Folder image is required!", 400);
  }

  if (!req.files?.galleryImages) {
    throw new ErrorHandler("Gallery images are required!", 400);
  }

  const existingFolder = await GalleryFolder.findOne({ folderTitle });
  if (existingFolder) {
    throw new ErrorHandler("Folder title already exists!", 409);
  }

  // Upload folder cover image
  const folderImageId = new mongoose.Types.ObjectId().toString();
  const folderImageName = `${folderTitle}_cover_${folderImageId}`;
  let folderImageUrl, folderImagePublicId;

  try {
    const folderResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: GALLERY_IMAGES_FOLDER,
          public_id: folderImageName,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.files.folderImage[0].buffer).pipe(stream);
    });

    folderImageUrl = folderResult.secure_url;
    folderImagePublicId = folderResult.public_id; // Use Cloudinary's public_id
  } catch (error) {
    console.error("Cloudinary Folder Image Upload Error:", error);
    throw new ErrorHandler("Failed to upload folder image", 500);
  }

  // Upload multiple gallery images with unique names
  const galleryImages = [];
  try {
    const uploadPromises = req.files.galleryImages.map((file, index) => {
      const imageId = new mongoose.Types.ObjectId().toString();
      const imageName = `${folderTitle}_${index}_${imageId}`;

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: GALLERY_IMAGES_FOLDER,
            public_id: imageName,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else
              resolve({
                imageUrl: result.secure_url,
                publicId: result.public_id,
              });
          }
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

  // Save to MongoDB with folder structure
  const galleryFolder = await GalleryFolder.create({
    folderImage: folderImageUrl,
    folderTitle,
    galleryImages,
    folderImagePublicId, // Use Cloudinary's public_id
  });

  res.status(201).json({
    result: 1,
    message: "Gallery folder created successfully",
    galleryFolder,
  });
});

// DELETE Gallery Folder
export const deleteGalleryFolder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const folder = await GalleryFolder.findById(id);
  if (!folder) {
    throw new ErrorHandler("Gallery folder not found!", 404);
  }

  try {
    // Collect all public IDs to delete
    const publicIdsToDelete = [
      folder.folderImagePublicId,
      ...folder.galleryImages.map(img => img.publicId)
    ].filter(Boolean);

    // Delete all images in one batch
    if (publicIdsToDelete.length > 0) {
      await cloudinary.api.delete_resources(publicIdsToDelete);
    }

    // Remove the folder from MongoDB
    await GalleryFolder.findByIdAndDelete(id);

    res.status(200).json({
      result: 1,
      message: "Gallery folder and all images deleted successfully",
    });
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    throw new ErrorHandler("Failed to delete images from Cloudinary", 500);
  }
});

// UPDATE GALLERY FOLDER (supports folder image & title update)
export const updateGalleryFolder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { folderTitle } = req.body;

  const folder = await GalleryFolder.findById(id);
  if (!folder) {
    throw new ErrorHandler("Gallery folder not found!", 404);
  }

  // 1. Update folder title if provided and different (case-insensitive)
  if (
    typeof folderTitle === "string" &&
    folderTitle.trim().toLowerCase() !== folder.folderTitle.trim().toLowerCase()
  ) {
    const existing = await GalleryFolder.findOne({
      folderTitle: { $regex: new RegExp(`^${folderTitle.trim()}$`, "i") }
    });
    if (existing && existing._id.toString() !== folder._id.toString()) {
      throw new ErrorHandler("Folder title already exists!", 409);
    }
    folder.folderTitle = folderTitle.trim();
  }

  // 2. Update folder image if provided
  if (req.files?.folderImage && req.files.folderImage[0]) {
    // Delete old folder image from Cloudinary
    if (folder.folderImagePublicId) {
      await cloudinary.uploader.destroy(folder.folderImagePublicId);
    }

    // Upload new folder image
    const folderImageId = new mongoose.Types.ObjectId().toString();
    const folderImageName = `${folder.folderTitle}_cover_${folderImageId}`;

    const folderResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: GALLERY_IMAGES_FOLDER,
          public_id: folderImageName,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.files.folderImage[0].buffer).pipe(stream);
    });

    folder.folderImage = folderResult.secure_url;
    folder.folderImagePublicId = folderResult.public_id; // Use Cloudinary's public_id
  }

  // 3. Handle gallery images removal
  let imagesToRemove = [];
  if (req.body.imagesToRemove) {
    imagesToRemove = Array.isArray(req.body.imagesToRemove)
      ? req.body.imagesToRemove
      : [req.body.imagesToRemove];
  }

  if (imagesToRemove.length > 0) {
    const imagesToDelete = folder.galleryImages.filter(
      img => imagesToRemove.includes(img.imageUrl)
    );
    const publicIdsToDelete = imagesToDelete.map(img => img.publicId);
    if (publicIdsToDelete.length > 0) {
      await cloudinary.api.delete_resources(publicIdsToDelete);
    }
    folder.galleryImages = folder.galleryImages.filter(
      img => !imagesToRemove.includes(img.imageUrl)
    );
  }

  // 4. Upload new gallery images
  if (req.files?.galleryImages) {
    const uploadPromises = req.files.galleryImages.map((file, index) => {
      const imageId = new mongoose.Types.ObjectId().toString();
      const imageName = `${folder.folderTitle}_new_${index}_${imageId}`;
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: GALLERY_IMAGES_FOLDER,
            public_id: imageName,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              imageUrl: result.secure_url,
              publicId: result.public_id,
            });
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    folder.galleryImages.push(...uploadedImages);
  }

  // 5. Save updated folder document
  await folder.save();

  res.status(200).json({
    result: 1,
    message: "Gallery folder updated successfully",
    folder,
  });
});

// GET ALL GALLERY FOLDERS
export const getAllGalleryFolders = catchAsyncError(async (req, res, next) => {
  const folders = await GalleryFolder.find().sort({ order: 1 });
  if (!folders?.length) {
    throw new ErrorHandler("No gallery folders found!", 404);
  }
  res.status(200).json({
    result: 1,
    message: "Gallery folders fetched successfully",
    folders,
  });
});

// GET SINGLE GALLERY FOLDER
export const getSingleGalleryFolder = catchAsyncError(async (req, res, next) => {
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
});

// REORDER GALLERY FOLDERS
export const reorderGalleryFolder = catchAsyncError(async (req, res, next) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ result: 0, message: "Invalid input" });
  }
  await Promise.all(
    order.map((id, index) =>
      GalleryFolder.findByIdAndUpdate(id, { order: index }, { new: true })
    )
  );
  res.status(200).json({ result: 1, message: "Folder reordered successfully" });
});