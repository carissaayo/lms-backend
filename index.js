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

// middlewares
import { verifyToken } from "./middleware.js";

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
app.put("/user/:id", verifyToken, updateUserProfile);
app.delete("/user/:id", verifyToken, deleteUser);

// Course Routes
app.get("/courses/:id", getSingleCourse);
app.get("/courses", getAllCoursesAvailable);
app.get("/courses/instructor/:instructor", getAllCoursesByAnInstructor);

// Protected Course Routes
app.post("/course", verifyToken, createCourse);
app.put("/course/:id", verifyToken, updateCourse);
app.delete("/course/:id", verifyToken, deleteCourse);
app.delete(
  "/courses/instructor/:instructor",
  verifyToken,
  deleteCoursesByAnInstructor
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
