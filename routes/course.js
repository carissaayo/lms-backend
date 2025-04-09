import express from "express";
import {
  approveCourseByAdmin,
  createCourse,
  deleteCourse,
  deleteCoursesByAnInstructor,
  filterCourses,
  getAllCoursesAvailable,
  getAllCoursesByAnInstructor,
  getSingleCourse,
  publishCourseByInstructor,
  updateCourse,
} from "../controllers/course.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import upload from "../middlewares/fileUpload.js";
import {
  deleteAllLectureInACourse,
  getAllLecturesInACourse,
} from "../controllers/lectures.js";

const router = express.Router();

// Course Routes
router.get("/filter", filterCourses);
router.get("/:id", getSingleCourse);
router.get("/instructor/:instructor", getAllCoursesByAnInstructor);

// Protected Course Routes For Students
router.get("/course/:id", getAllLecturesInACourse);

// Protected Course Routes For Instructors
router.post("/create", verifyToken, upload.single("image"), createCourse);
router.put("/:id/update-course", verifyToken, updateCourse);
router.put("/:id/delete-course", verifyToken, deleteCourse);
router.put("/instructor/:instructor", verifyToken, deleteCoursesByAnInstructor);
router.put("/publish-course/:id", verifyToken, publishCourseByInstructor);
router.put("/:id/lectures", verifyToken, deleteAllLectureInACourse);

// Protected Course Routes For Admins
router.put("/approve-course/:id", verifyToken, approveCourseByAdmin);
router.get("/", verifyToken, getAllCoursesAvailable);

export default router;
