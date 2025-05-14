import express from "express";
import {
  getBanner,
  updateBanner,
  createBanner,
  getAllBanners,
} from "../controllers/BannerController.js";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";

router.post(
  "/",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  createBanner,
);

router.get("/:bannerType/:id", getBanner);

router.put(
  "/:bannerType/:id",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  updateBanner,
);

router.get("/all-banners", getAllBanners);

export default router;
