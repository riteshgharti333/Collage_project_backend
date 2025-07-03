import express from "express";

import {
  createExam,
  deleteExam,
  getAllExams,
  getExamById,
  searchCourse,
  updateExam,
} from "../controllers/ExamController.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/new-exam", isAuthenticated, isAdmin, createExam);
router.get("/all-exams", getAllExams);

router.get("/search", searchCourse);

router.get("/:id", getExamById);
router.delete("/:id", isAuthenticated, isAdmin, deleteExam);
router.put("/:id", isAuthenticated, isAdmin, updateExam);

export default router;
