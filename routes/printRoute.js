import express from "express";
import { printCertificate } from "../controllers/PrintController.js";

const router = express.Router();

router.get("/:id", printCertificate);

export default router;
