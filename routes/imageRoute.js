import express from "express";
import { uploadImage } from "../controllers/ImageController.js";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";

router.post(
  "/",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  uploadImage,
);

export default router;
