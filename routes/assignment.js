import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import {
  createLecture,
  deleteSingleLecture,
  getSingleLecture,
  updateLecture,
} from "../controllers/lectures.js";
import {
  createAssignment,
  getAllAssignments,
  getAssignmentsByAnInstructor,
  getSingleAssignment,
  updateAssignment,
} from "../controllers/assignment.js";

const router = express.Router();

// Protected Assignments Routes
router.post("/:lectureId/create-assignment", verifyToken, createAssignment);
// router.put("/:id/delete-lecture", verifyToken, deleteSingleLecture);
router.get("/:assignmentId", verifyToken, getSingleAssignment);
router.get(
  "/instructor/:instructorId",
  verifyToken,
  getAssignmentsByAnInstructor
);
router.get("/", verifyToken, getAllAssignments);
router.put("/:assignmentId/update-assignment", verifyToken, updateAssignment);

export default router;
