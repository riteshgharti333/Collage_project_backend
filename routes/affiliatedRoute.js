import express from "express";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";
import {
  deleteAffiliated,
  getAllAffiliated,
  getSingleAffiliated,
  newAffiliated,
} from "../controllers/AffiliatedController.js";

router.post(
  "/new-affiliate",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  newAffiliated
);

router.get("/all-affiliates", getAllAffiliated);

router.get("/:id", getSingleAffiliated);

router.delete("/:id", deleteAffiliated);

export default router;
