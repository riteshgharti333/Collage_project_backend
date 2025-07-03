import express from 'express';
import { createOrUpdateAbout, getAbout } from '../controllers/AboutController.js';

import {isAdmin} from "../middlewares/isAdmin.js";
import {isAuthenticated} from "../middlewares/isAuthenticated.js";



const router = express.Router();

router.route("/about-content").get(getAbout);

router
  .route("/about-content")
  .put(isAuthenticated, isAdmin, createOrUpdateAbout);

export default router;
