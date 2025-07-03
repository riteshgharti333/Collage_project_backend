import express from "express";
import {
  createStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
  reorderStaff,
} from "../controllers/StaffController.js";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

router.post(
  "/new-staff",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  createStaff
);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  updateStaff
);

router.get("/all-staffs", getAllStaff);

router.get("/:id", getSingleStaff);

router.delete("/:id", isAuthenticated, isAdmin, deleteStaff);

router.patch("/reorder", isAuthenticated, isAdmin, reorderStaff);

export default router;
