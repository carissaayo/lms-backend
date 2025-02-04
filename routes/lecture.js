import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import {
  createLecture,
  deleteSingleLecture,
  getSingleLecture,
  updateLecture,
} from "../controllers/lectures.js";
import upload from "../middlewares/fileUpload.js";

const router = express.Router();

// Protected Lectures Routes
router.post(
  "/:courseId/lecture",
  verifyToken,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "notes", maxCount: 1 },
  ]),
  createLecture
);
router.put("/:id/delete-lecture", verifyToken, deleteSingleLecture);

router.put("/:id/update-lecture", verifyToken, updateLecture);

// Lecure Routes
router.get("/course/lectures/:id", getSingleLecture);

export default router;
