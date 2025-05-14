import express from "express";
import multer from "multer";
import sharp from "sharp";
import {
  createGalleryFolder,
  deleteGalleryFolder,
  getAllGalleryFolders,
  getSingleGalleryFolder,
  updateGalleryFolder,
} from "../controllers/GalleryFolderController.js";

// ✅ Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Multer handles both fields
const galleryUpload = upload.fields([
  { name: "folderImage", maxCount: 1 },
  { name: "galleryImages" },
]);

// ✅ Middleware to compress all images in memory (no saving to disk)
const processImages = async (req, res, next) => {
  if (!req.files) return next();

  try {
    const compressToWebp = async (fileBuffer) => {
      return await sharp(fileBuffer)
        .toFormat("webp")
        .webp({ quality: 70 })
        .toBuffer(); // returns compressed buffer
    };

    // ✅ folderImage (single)
    if (req.files.folderImage) {
      const original = req.files.folderImage[0];
      const compressed = await compressToWebp(original.buffer);

      req.files.folderImage[0].buffer = compressed;
      req.files.folderImage[0].mimetype = "image/webp";
    }

    // ✅ galleryImages (multiple)
    if (req.files.galleryImages) {
      await Promise.all(
        req.files.galleryImages.map(async (img) => {
          const compressed = await compressToWebp(img.buffer);
          img.buffer = compressed;
          img.mimetype = "image/webp";
        }),
      );
    }

    next();
  } catch (error) {
    console.error("Image compression error:", error);
    res.status(500).json({ message: "Failed to process images" });
  }
};

const router = express.Router();

router.post(
  "/new-gallery-folder",
  galleryUpload,
  processImages,
  createGalleryFolder,
);

router.put("/:id", galleryUpload, processImages, updateGalleryFolder);

router.get("/all-gallery-folders", getAllGalleryFolders);
router.get("/:id", getSingleGalleryFolder);
router.delete("/:id", deleteGalleryFolder);

export default router;
