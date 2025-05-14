import express from "express";
import {
  createMarksheet,
  getAllMarksheets,
  getSingleMarksheet,
  updateMarksheet,
  deleteMarksheet,
} from "../controllers/MarksheetController.js";

const router = express.Router();

// CREATE
router.post("/new-marksheet", createMarksheet);

// GET ALL
router.get("/all-marksheets", getAllMarksheets);

// GET SINGLE
router.get("/:id", getSingleMarksheet);

// UPDATE
router.put("/:id", updateMarksheet);

// DELETE
router.delete("/:id", deleteMarksheet);

export default router;
