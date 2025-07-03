import express from "express";

import {
  approveEnquiry,
  createEnquiry,
  deleteEnquiry,
  getAllEnquiries,
  getEnquiryById,
} from "../controllers/EnquiryController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/new-enquiry", createEnquiry);
router.get("/all-enquiry", getAllEnquiries);
router.get("/:id", getEnquiryById);
router.delete("/:id", isAuthenticated, isAdmin, deleteEnquiry);
router.put("/approve/:id", isAuthenticated, isAdmin, approveEnquiry);

export default router;
