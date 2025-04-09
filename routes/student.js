import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import {
  addCompletedLecture,
  getStudentDetails,
  registerForCourse,
} from "../controllers/student.js";

const router = express.Router();

// Student Routes
router.get("/studentId", verifyToken, getStudentDetails);
router.post("/:courseId/register", verifyToken, registerForCourse);
router.post("/:lectureId/mark-completed", verifyToken, addCompletedLecture);
export default router;
