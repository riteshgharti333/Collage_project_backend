import express from "express";

import {
  changePassword,
  // forgotPassword,
  login,
  logout,
  profile,
  register,
  // resetPassword,
} from "../controllers/AuthController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";


import { approveContact } from "../controllers/ContactController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-password", isAuthenticated, changePassword);

router.get("/profile", isAuthenticated, profile);

export default router;
