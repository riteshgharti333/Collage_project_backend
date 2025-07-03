import express from "express";
import {
  createHomeContentDetails,
  getHomeContentDetails,
  updateHomeContentDetails,
} from "../controllers/HomeContentDetailsController.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// router.post("/new-home-detail", createHomeContentDetails);

router.get("/only", getHomeContentDetails);
router.put("/update", isAuthenticated, isAdmin, updateHomeContentDetails);

export default router;
