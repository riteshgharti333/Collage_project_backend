import multer from "multer";
import sharp from "sharp";

// ✅ Multer configuration (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Middleware: compress image in memory using Sharp
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Compress the image and convert to WebP format
    const compressedBuffer = await sharp(req.file.buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toBuffer();

    // Replace original buffer with compressed one
    req.file.buffer = compressedBuffer;
    req.file.mimetype = "image/webp";

    next();
  } catch (error) {
    console.error("Image compression failed:", error);
    return res.status(500).json({ message: "Image compression failed" });
  }
};

export default {
  upload,
  processImage,
};
