import express from "express";

import {
  approveContact,
  createContact,
  deleteContact,
  getAllContacts,
  getContact,
} from "../controllers/ContactController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/new-contact", createContact);
router.get("/all-contact", getAllContacts);
router.get("/:id", getContact);
router.delete("/:id", isAuthenticated, isAdmin, deleteContact);
router.put("/approve/:id", isAuthenticated, isAdmin, approveContact);

export default router;
