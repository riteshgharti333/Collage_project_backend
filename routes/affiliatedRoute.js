import express from "express";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";
import {
  deleteAffiliated,
  getAllAffiliated,
  getSingleAffiliated,
  newAffiliated,
} from "../controllers/AffiliatedController.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

router.post(
  "/new-affiliate",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  newAffiliated
);

router.get("/all-affiliates", getAllAffiliated);

router.get("/:id", getSingleAffiliated);

router.delete("/:id", isAuthenticated, isAdmin, deleteAffiliated);

export default router;
