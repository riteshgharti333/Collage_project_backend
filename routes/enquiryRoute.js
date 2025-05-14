import express from "express";

import {
  approveEnquiry,
  createEnquiry,
  deleteEnquiry,
  getAllEnquiries,
  getEnquiryById,
} from "../controllers/EnquiryController.js";

const router = express.Router();

router.post("/new-enquiry", createEnquiry);
router.get("/all-enquiry", getAllEnquiries);
router.get("/:id", getEnquiryById);
router.delete("/:id", deleteEnquiry);

router.put("/approve/:id", approveEnquiry);

export default router;
