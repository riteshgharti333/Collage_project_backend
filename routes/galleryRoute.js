import express from "express";

import {
  createGallery,
  deleteImage,
  getAllGallery,
} from "../controllers/GalleryController.js";

const router = express.Router();

router.post("/new-gallery", createGallery);
router.get("/all-gallery", getAllGallery);
router.delete("/:galleryId/:imageId", deleteImage);

export default router;
