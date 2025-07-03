import express from "express";
import {
  createAlumni,
  getAlumni,
  getSingleAlumni,
  updateAlumni,
  deleteAlumni,
  reorderAlumni,
} from "../controllers/AlumniController.js";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

router.post(
  "/new-alumni",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  createAlumni
);

router.get("/all-alumnies", getAlumni);

router.get("/:id", getSingleAlumni);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  updateAlumni
);

router.delete("/:id", isAuthenticated, isAdmin, deleteAlumni);

router.patch("/reorder", isAuthenticated, isAdmin, reorderAlumni);

export default router;
