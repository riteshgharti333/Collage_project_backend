import express from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "../controllers/CourseController.js";

import imageHandler from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post(
  "/new-course",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "smCourseImage", maxCount: 1 },
  ]),
  imageHandler.processImage,
  createCourse
);

router.get("/all-course", getAllCourses);

router.get("/:id", getCourseById);

router.delete("/:id", isAuthenticated, isAdmin, deleteCourse);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  imageHandler.upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "smCourseImage", maxCount: 1 },
  ]),
  imageHandler.processImage,
  updateCourse
);

export default router;
