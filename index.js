import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import bodyParser from "body-parser";

// routes
import {
  createUser,
  deleteUser,
  getSingleUser,
  getAllUsers,
  loginUser,
  logoutUser,
  updateUserProfile,
} from "./routes/users.js";
import {
  createCourse,
  deleteCourse,
  deleteCoursesByAnInstructor,
  getAllCoursesAvailable,
  getAllCoursesByAnInstructor,
  getSingleCourse,
  updateCourse,
} from "./routes/course.js";
import {
  createLecture,
  deleteAllLectureInACourse,
  deleteSingleLecture,
  getAllLecturesInACourse,
  getSingleLecture,
  updateLecture,
} from "./routes/lectures.js";

// middlewares
import { verifyToken } from "./middlewares/verifyToken.js";
import upload from "./middlewares/fileUpload.js";
import { changePassword } from "./routes/password.js";

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error Connecting to MongoDb ${err}`));

// User Routes
app.post("/register", createUser);
app.post("/login", loginUser);
app.post("/logout", logoutUser);
app.get("/user/:id", getSingleUser);

// Protected User Routes
app.get("/users", verifyToken, getAllUsers);
app.put("/users/:id", verifyToken, updateUserProfile);
app.put("/user/:id", verifyToken, deleteUser);
app.post("/change-password", verifyToken, upload.none(), changePassword);

// Course Routes
app.get("/courses/:id", getSingleCourse);
app.get("/courses/instructor/:instructor", getAllCoursesByAnInstructor);

// Protected Course Routes
app.get("/courses", verifyToken, getAllCoursesAvailable);
app.post("/course", verifyToken, upload.single("image"), createCourse);
app.put("/course/:id", verifyToken, updateCourse);
app.put("/course/:id", verifyToken, deleteCourse);
app.put(
  "/courses/instructor/:instructor",
  verifyToken,
  deleteCoursesByAnInstructor
);

// Protected Lectures Routes
app.post(
  "/:courseId/lecture",
  verifyToken,
  upload.single("video"),
  createLecture
);
app.put("/course/lectures/:id", verifyToken, deleteSingleLecture);
app.put("/:id/lectures", verifyToken, deleteAllLectureInACourse);
app.put("/lectures/:id", verifyToken, upload.single("video"), updateLecture);

// Lecure Routes
app.get("/course/lectures/:id", getSingleLecture);
app.get("/course/:id", getAllLecturesInACourse);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
