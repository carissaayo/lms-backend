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
import { submitQuizz, takeQuizz } from "../controllers/student.js";

const router = express.Router();

// Protected Quizz Routes for Instructors
router.post("/:courseId", verifyToken, createQuizz);
router.put("/:instructorId/quizzes", verifyToken, deleteQuizzesByAnInstructor);
router.put("/:quizzId/delete-quizz", verifyToken, deleteSingleQuizz);
router.put("/:quizzId/update-quizz", verifyToken, updateQuizz);

// Protected Quizz Routes for Students
router.get("/all-quizzes", verifyToken, getAllQuizzes);
router.get("/:instructorId/quizzes", verifyToken, getQuizzesByAnInstructor);
router.get("/:quizzId", verifyToken, getSingleQuizz);
router.put("/participate-in-quizz/:id", verifyToken, takeQuizz);
router.put("/submit-quizz/:id", verifyToken, submitQuizz);
export default router;
