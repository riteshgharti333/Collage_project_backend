import express from "express";

import {
  createGallery,
  deleteImage,
  getAllGallery,
} from "../controllers/GalleryController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/new-gallery", isAuthenticated, isAdmin, createGallery);
router.get("/all-gallery", getAllGallery);
router.delete("/:galleryId/:imageId", isAuthenticated, isAdmin, deleteImage);

export default router;
