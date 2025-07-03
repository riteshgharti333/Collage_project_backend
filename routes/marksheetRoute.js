import express from "express";
import {
  createMarksheet,
  getAllMarksheets,
  getSingleMarksheet,
  updateMarksheet,
  deleteMarksheet,
} from "../controllers/MarksheetController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// CREATE
router.post("/new-marksheet", isAuthenticated, isAdmin, createMarksheet);

// GET ALL
router.get("/all-marksheets", getAllMarksheets);

// GET SINGLE
router.get("/:id", getSingleMarksheet);

// UPDATE
router.put("/:id", isAuthenticated, isAdmin, updateMarksheet);

// DELETE
router.delete("/:id", isAuthenticated, isAdmin, deleteMarksheet);

export default router;
