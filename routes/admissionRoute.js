import express from "express";
import multer from "multer";
import {
  approveAdmission,
  createAdmission,
  deleteAdmission,
  getAdmissionById,
  getAllAdmissions,
  updateAdmission,
} from "../controllers/AdmissionController.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/x-rar-compressed",
      "audio/mpeg",
      "video/mp4",
      "audio/wav",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"), false);
    }
  },
});

const router = express.Router();

// Route for new admission with file upload
router.post(
  "/new-admission",
  upload.fields([{ name: "photo", maxCount: 1 }, { name: "document" }]),
  createAdmission
);

router.get("/all-admission", getAllAdmissions);

router.get("/:id", getAdmissionById);
router.delete("/:id", deleteAdmission);

router.put("/admission-approve/:id", approveAdmission);

router.put(
  "/:id",
  upload.fields([{ name: "photo", maxCount: 1 }, { name: "document" }]),
  updateAdmission
);

export default router;
