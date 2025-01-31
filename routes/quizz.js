import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import { createQuizz } from "../controllers/quizzes.js";

const router = express.Router();

// Protected Lectures Routes
router.post("/:courseId", verifyToken, createQuizz);
// router.put("/:id/delete-lecture", verifyToken, deleteSingleLecture);

// router.put("/:id/update-lecture", verifyToken, updateLecture);

// Lecure Routes
// router.get("/course/lectures/:id", getSingleLecture);

export default router;
