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
router.get("/:id", getSingleCourse);
router.get("/instructor/:instructor", getAllCoursesByAnInstructor);
router.get("/", filterCourses);

// Protected Course Routes
router.get("/get-courses-by-admin", verifyToken, getAllCoursesAvailable);
router.post("/course", verifyToken, upload.single("image"), createCourse);
router.put("/course/:id", verifyToken, updateCourse);
router.put("/course/:id", verifyToken, deleteCourse);
router.put("/instructor/:instructor", verifyToken, deleteCoursesByAnInstructor);
router.put("/approve-course/:id", verifyToken, approveCourseByAdmin);
router.put("/publish-course/:id", verifyToken, publishCourseByInstructor);

router.put("/:id/lectures", verifyToken, deleteAllLectureInACourse);
router.get("/course/:id", getAllLecturesInACourse);

export default router;
