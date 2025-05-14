import express from "express";
import {
  createAlumni,
  getAlumni,
  getSingleAlumni,
  updateAlumni,
  deleteAlumni,
} from "../controllers/AlumniController.js";

const router = express.Router();

import imageHandler from "../middlewares/multer.js";

router.post(
  "/new-alumni",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  createAlumni,
);

router.get("/all-alumnies", getAlumni);

router.get("/:id", getSingleAlumni);

router.put(
  "/:id",
  imageHandler.upload.single("image"),
  imageHandler.processImage,
  updateAlumni,
);

router.delete("/:id", deleteAlumni);

export default router;
