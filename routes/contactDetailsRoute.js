import express from "express";
import {
  createContactDetails,
  getContactDetails,
  updateContactDetails,
} from "../controllers/ContactDetailsController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/create", isAuthenticated, isAdmin, createContactDetails);
router.get("/only", getContactDetails);
router.put("/update", isAuthenticated, isAdmin, updateContactDetails);

export default router;
