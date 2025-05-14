import express from "express";
import {
  createFounder,
  getAllFounders,
  getFounder,
  updateFounder,
  deleteFounder,
} from "../controllers/FounderController.js";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";

router.post(
  "/new-founder",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  createFounder,
);

router.put(
  "/:id",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  updateFounder,
);

router.get("/all-founders", getAllFounders);

router.get("/:id", getFounder);

router.delete("/:id", deleteFounder);

export default router;
