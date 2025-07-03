import express from "express";
import multer from "multer";
import sharp from "sharp";
import {
  createGalleryFolder,
  deleteGalleryFolder,
  getAllGalleryFolders,
  getSingleGalleryFolder,
  reorderGalleryFolder,
  updateGalleryFolder,
} from "../controllers/GalleryFolderController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const galleryUpload = upload.fields([
  { name: "folderImage", maxCount: 1 },
  { name: "galleryImages" },
]);

const processImages = async (req, res, next) => {
  if (!req.files) return next();

  try {
    const compressToWebp = async (fileBuffer) => {
      return await sharp(fileBuffer)
        .toFormat("webp")
        .webp({ quality: 70 })
        .toBuffer();
    };

    if (req.files.folderImage) {
      const original = req.files.folderImage[0];
      const compressed = await compressToWebp(original.buffer);

      req.files.folderImage[0].buffer = compressed;
      req.files.folderImage[0].mimetype = "image/webp";
    }

    if (req.files.galleryImages) {
      await Promise.all(
        req.files.galleryImages.map(async (img) => {
          const compressed = await compressToWebp(img.buffer);
          img.buffer = compressed;
          img.mimetype = "image/webp";
        })
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
  isAuthenticated,
  isAdmin,
  galleryUpload,
  processImages,
  createGalleryFolder
);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  galleryUpload,
  processImages,
  updateGalleryFolder
);

router.get("/all-gallery-folders", getAllGalleryFolders);
router.get("/:id", getSingleGalleryFolder);
router.delete("/:id", isAuthenticated, isAdmin, deleteGalleryFolder);

router.patch("/reorder", isAuthenticated, isAdmin, reorderGalleryFolder);

export default router;
