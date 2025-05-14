import express from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "../controllers/CourseController.js";

import imageHandler from "../middlewares/multer.js";

const router = express.Router();

router.post(
  "/new-course",
  imageHandler.upload.single("bannerImage"),
  imageHandler.processImage,
  createCourse
);
router.get("/all-course", getAllCourses);

router.get("/:id", getCourseById);

router.delete("/:id", deleteCourse);

router.put(
  "/:id",
  imageHandler.upload.single("bannerImage"),
  imageHandler.processImage,
  updateCourse
);

export default router;
