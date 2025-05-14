import express from "express";
import {
  createStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/StaffController.js";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";

router.post(
  "/new-staff",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  createStaff,
);

router.put(
  "/:id",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  updateStaff,
);

router.get("/all-staffs", getAllStaff);

router.get("/:id", getSingleStaff);

router.delete("/:id", deleteStaff);

export default router;
