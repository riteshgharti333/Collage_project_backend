import cloudinary from "../utils/cloudinary.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

export const uploadImage = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    throw new ErrorHandler("No image file provided!", 400);
  }

  const result = await cloudinary.uploader
    .upload_stream(
      {
        folder: "tk-production-images/gallery", // Specify Cloudinary folder
        format: "webp", // Automatically convert to WebP
      },
      (error, cloudinaryResult) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          throw new ErrorHandler("Failed to upload image", 500);
        }

        res.status(201).json({
          result: 1,
          message: "Image uploaded successfully",
          imageUrl: cloudinaryResult.secure_url,
        });
      },
    )
    .end(req.file.buffer);
});
