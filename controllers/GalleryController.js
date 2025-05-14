import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Gallery } from "../models/galleryModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// CREATE GALLERY
export const createGallery = catchAsyncError(async (req, res, next) => {
  const { images } = req.body;

  if (!images || images.length === 0) {
    throw new ErrorHandler("At least one image is required!", 400);
  }

  const gallery = await Gallery.create({ images });

  res.status(201).json({
    result: 1,
    message: "Gallery created successfully",
    gallery,
  });
});

// GET ALL IMAGES (Parent ID + Image ID + Image URLs)
export const getAllGallery = catchAsyncError(async (req, res, next) => {
  const gallery = await Gallery.find().sort({ createdAt: -1 });

  if (!gallery || gallery.length === 0) {
    throw new ErrorHandler("No images found", 404);
  }

  // ✅ Extract Parent ID + Image ID + Image URL
  const allImages = gallery.flatMap((item) =>
    item.images.map((img) => ({
      parentId: item._id,
      imageId: img._id,
      img: img.img,
    })),
  );

  res.status(200).json({
    result: 1,
    message: "Gallery images fetched successfully",
    images: allImages,
  });
});

// DELETE IMAGE BY ID
export const deleteImage = catchAsyncError(async (req, res, next) => {
  const { galleryId, imageId } = req.params;

  const gallery = await Gallery.findById(galleryId);

  if (!gallery) {
    throw new ErrorHandler("Gallery not found", 404);
  }

  // Filter out the image to delete
  const updatedImages = gallery.images.filter(
    (img) => img._id.toString() !== imageId,
  );

  if (gallery.images.length === updatedImages.length) {
    throw new ErrorHandler("Image not found", 404);
  }

  // Update the gallery with remaining images
  gallery.images = updatedImages;
  await gallery.save();

  res.status(200).json({
    result: 1,
    message: "Image deleted successfully",
    gallery,
  });
});
