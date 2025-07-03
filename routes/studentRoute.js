import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
} from "../controllers/StudentController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/new-student", isAuthenticated, isAdmin, createStudent);

router.get("/all-students", getAllStudents);

router.get("/search", searchStudents);

router.get("/:id", getStudentById);

router.put("/:id", isAuthenticated, isAdmin, updateStudent);

router.delete("/:id", isAuthenticated, isAdmin, deleteStudent);

export default router;
