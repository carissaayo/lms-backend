import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import {
  createAssignment,
  deleteAssignmentByAnInstructor,
  deleteSingleAssignment,
  getAllAssignments,
  getAssignmentsByAnInstructor,
  getSingleAssignment,
  updateAssignment,
} from "../controllers/assignment.js";

const router = express.Router();

// Protected Assignments Routes
router.post("/:lectureId/create-assignment", verifyToken, createAssignment);
router.get("/:assignmentId", verifyToken, getSingleAssignment);
router.get(
  "/instructor/:instructorId",
  verifyToken,
  getAssignmentsByAnInstructor
);
router.put("/:id/delete-assignment", verifyToken, deleteSingleAssignment);
router.put(
  "/:instructorId/delete-assignments",
  verifyToken,
  deleteAssignmentByAnInstructor
);
router.get("/", verifyToken, getAllAssignments);
router.put("/:assignmentId/update-assignment", verifyToken, updateAssignment);

export default router;
