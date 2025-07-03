import express from "express";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";
import {
  deleteHomeContent,
  getAllHomeContent,
  getSingleHomeContent,
  newHomeContent,
  updateHomeContent,
} from "../controllers/HomeContentController.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

router.post(
  "/new-homeContent-image",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  newHomeContent
);

router.get("/all-homeContent-images", getAllHomeContent);

router.get("/:id", getSingleHomeContent);

router.delete("/:id", isAuthenticated, isAdmin, deleteHomeContent);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  updateHomeContent
);

export default router;
