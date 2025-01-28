import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import upload from "../middlewares/fileUpload.js";
import {
  createLecture,
  deleteSingleLecture,
  getSingleLecture,
  updateLecture,
} from "../controllers/lectures.js";

const router = express.Router();

const lectureCpUpload = upload.array("notes", 10);
// Protected Lectures Routes
router.post("/:courseId/lecture", verifyToken, lectureCpUpload, createLecture);
router.put("/:id/delete-lecture", verifyToken, deleteSingleLecture);

router.put(
  "/:id/update-lecture",
  verifyToken,
  upload.single("video"),
  updateLecture
);

// Lecure Routes
router.get("/course/lectures/:id", getSingleLecture);

export default router;
