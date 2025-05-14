import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
} from "../controllers/StudentController.js";

const router = express.Router();

router.post("/new-student", createStudent);

router.get("/all-students", getAllStudents);

router.get("/search", searchStudents);

router.get("/:id", getStudentById);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);


export default router;
