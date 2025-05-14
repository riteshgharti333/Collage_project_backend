import express from "express";
import { getCertificate } from "../controllers/CertificateController.js";

const router = express.Router();

router.get("/:enrollmentId", getCertificate);

export default router;
