import express from "express";
import { getSecondCertificate } from "../controllers/SecondController.js";

const router = express.Router();

router.get("/:enrollmentId", getSecondCertificate);

export default router;
