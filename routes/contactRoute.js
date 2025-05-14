import express from "express";

import {
  approveContact,
  createContact,
  deleteContact,
  getAllContacts,
  getContact,
} from "../controllers/ContactController.js";

const router = express.Router();

router.post("/new-contact", createContact);
router.get("/all-contact", getAllContacts);
router.get("/:id", getContact);
router.delete("/:id", deleteContact);

router.put("/approve/:id", approveContact);

export default router;
