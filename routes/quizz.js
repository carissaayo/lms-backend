import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import {
  createQuizz,
  deleteQuizzesByAnInstructor,
  deleteSingleQuizz,
  getAllQuizzes,
  getQuizzesByAnInstructor,
  getSingleQuizz,
  updateQuizz,
} from "../controllers/quizzes.js";

const router = express.Router();

// Protected Quizz Routes
router.post("/:courseId", verifyToken, createQuizz);
router.get("/all-quizzes", verifyToken, getAllQuizzes);
router.get("/:instructorId/quizzes", verifyToken, getQuizzesByAnInstructor);
router.put("/:instructorId/quizzes", verifyToken, deleteQuizzesByAnInstructor);
router.get("/:quizzId", verifyToken, getSingleQuizz);
router.put("/:quizzId/delete-quizz", verifyToken, deleteSingleQuizz);
router.put("/:quizzId/update-quizz", verifyToken, updateQuizz);

export default router;
