import express from "express";
import {
  getBanner,
  updateBanner,
  createBanner,
  getAllBanners,
} from "../controllers/BannerController.js";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

router.post(
  "/",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  createBanner
);

router.get("/:bannerType/:id", getBanner);

router.put(
  "/:bannerType/:id",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  updateBanner
);

router.get("/all-banners", getAllBanners);

export default router;
