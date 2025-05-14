import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import { errorMiddleware } from "./middlewares/error.js";
import authRouter from "./routes/authRoute.js";
import admissionRouter from "./routes/admissionRoute.js";
import enquiryRouter from "./routes/enquiryRoute.js";
import contactRouter from "./routes/contactRoute.js";

import galleryRouter from "./routes/galleryRoute.js";
import bannerRouter from "./routes/bannerRoute.js";

import staffRouter from "./routes/staffRoute.js";
import founderRouter from "./routes/founderRoute.js";

import imageRouter from "./routes/imageRoute.js";
import studentRouter from "./routes/studentRoute.js";
import certificateRouter from "./routes/certificateRoute.js";
import printRouter from "./routes/printRoute.js";

import galleryFolderRouter from "./routes/galleryFolderRoute.js";
import alumniRouter from "./routes/alumniRoute.js";
import courseRouter from "./routes/courseRoute.js";
import examRouter from "./routes/examRoute.js";
import marksheetRouter from "./routes/marksheetRoute.js";
import secondCertificateRouter from "./routes/secondCertificateRoute.js";
import affiliateRouter from "./routes/affiliatedRoute.js";

// Initialize Express app
export const app = express();

app.use(helmet());
app.use(mongoSanitize());

// Load environment variables
config({
  path: "./data/config.env",
});

// Configure CORS settings
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
];

// Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new ErrorHandler("Not allowed by CORS", 403));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/backend/api/auth", authRouter);
app.use("/backend/api/admission", admissionRouter);
app.use("/backend/api/enquiry", enquiryRouter);
app.use("/backend/api/contact", contactRouter);
app.use("/backend/api/gallery", galleryRouter);
app.use("/backend/api/banner", bannerRouter);
app.use("/backend/api/staff", staffRouter);
app.use("/backend/api/founder", founderRouter);
app.use("/backend/api/upload", imageRouter);

app.use("/backend/api/student", studentRouter);

app.use("/backend/api/certificate", certificateRouter);
app.use("/backend/api/print-marksheet", printRouter);
app.use("/backend/api/second-certificate", secondCertificateRouter);

app.use("/backend/api/gallery-folder", galleryFolderRouter);
app.use("/backend/api/alumni", alumniRouter);
app.use("/backend/api/course", courseRouter);
app.use("/backend/api/exam", examRouter);
app.use("/backend/api/marksheet", marksheetRouter);
app.use("/backend/api/affiliate", affiliateRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Backend");
});

// Error Middleware
app.use(errorMiddleware);
