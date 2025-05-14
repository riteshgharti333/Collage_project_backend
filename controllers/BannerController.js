import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Banner } from "../models/bannerModel.js";
import ErrorHandler from "../utils/errorHandler.js";

import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

//  CREATE BANNER
export const createBanner = catchAsyncError(async (req, res, next) => {
  const { type } = req.body;

  if (!type || !req.file) {
    throw new ErrorHandler("Banner type and image are required!", 400);
  }

  const existingBanner = await Banner.findOne({ type });

  if (existingBanner) {
    throw new ErrorHandler(`Banner already exists with type: ${type}`, 409);
  }

  let imageUrl;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `thenad_data/banner/${type}`,
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

  const banner = await Banner.create({ type, image: imageUrl });

  res.status(201).json({
    result: 1,
    message: "Banner created successfully",
    banner,
  });
});

// ✅ GET BANNER BY TYPE & ID
export const getBanner = catchAsyncError(async (req, res, next) => {
  const { bannerType, id } = req.params;

  const banner = await Banner.findOne({ type: bannerType, _id: id });

  if (!banner) {
    throw new ErrorHandler(`Banner not found: ${bannerType}`, 404);
  }

  res.status(200).json({
    result: 1,
    message: `Banner ${bannerType} with ID ${id} fetched successfully`,
    image: banner.image,
    id: banner._id,
  });
});

// ✅ UPDATE BANNER IMAGE BY TYPE & ID
export const updateBanner = catchAsyncError(async (req, res, next) => {
  const { bannerType, id } = req.params;

  const banner = await Banner.findOne({ type: bannerType, _id: id });

  if (!banner) {
    throw new ErrorHandler(`Banner not found: ${bannerType}`, 404);
  }

  let imageUrl = banner.image;

  if (req.file) {
    try {
      // ✅ Destroy old image from Cloudinary with the correct folder path
      if (banner.image) {
        const oldImageUrl = banner.image;

        // 🛠️ Extract the public ID correctly with folder path
        const publicId = oldImageUrl.split("/").pop().split(".")[0];

        // ✅ Delete from the correct folder path using bannerType
        await cloudinary.uploader.destroy(
          `thenad_data/banner/${bannerType}/${publicId}`,
        );
      }

      // ✅ Upload new image using streamifier
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `thenad_data/banner/${bannerType}`,
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

  // ✅ Update the banner with new image
  banner.image = imageUrl;
  await banner.save();

  res.status(200).json({
    result: 1,
    message: `Banner ${bannerType} with ID ${id} updated successfully`,
    image: banner.image,
    id: banner._id,
  });
});

// ✅ GET ALL BANNERS
export const getAllBanners = catchAsyncError(async (req, res, next) => {
  const banners = await Banner.find();

  if (!banners || banners.length === 0) {
    throw new ErrorHandler("No banners found", 404);
  }

  const formattedBanners = banners.map((banner) => ({
    id: banner._id,
    type: banner.type,
    image: banner.image,
  }));

  res.status(200).json({
    result: 1,
    message: "All banners fetched successfully",
    count: formattedBanners.length,
    banners: formattedBanners,
  });
});
