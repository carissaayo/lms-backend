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
import { submitAssignment } from "../controllers/student.js";
import upload from "../middlewares/fileUpload.js";

const router = express.Router();

// Protected Assignments Routes
upload.single("question"),
  router.post(
    "/:lectureId/create-assignment",
    verifyToken,
    upload.single("question"),
    createAssignment
  );
router.post(
  "/:assignmentId/submit-assignment",
  verifyToken,
  upload.single("answer"),
  submitAssignment
);
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
