import express from "express";

import {
  createExam,
  deleteExam,
  getAllExams,
  getExamById,
  searchCourse,
  updateExam,
} from "../controllers/ExamController.js";

const router = express.Router();

router.post("/new-exam", createExam);
router.get("/all-exams", getAllExams);

router.get("/search", searchCourse);

router.get("/:id", getExamById);
router.delete("/:id", deleteExam);
router.put("/:id", updateExam);


export default router;
