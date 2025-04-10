import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import bodyParser from "body-parser";

// routes
import authRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";
import studentRouter from "./routes/student.js";
import courseRouter from "./routes/course.js";
import lectureRouter from "./routes/lecture.js";
import uploadRouter from "./routes/uploadFiles.js";
import quizzRouter from "./routes/quizz.js";
import assignmentRouter from "./routes/assignment.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error Connecting to MongoDb ${err}`));

app.use("/api/users", userRouter);
app.use("/api/students", studentRouter);
app.use("/api", authRouter);
app.use("/api/courses", courseRouter);
app.use("/api/lectures", lectureRouter);
app.use("/api/upload-file", uploadRouter);
app.use("/api/quizz", quizzRouter);
app.use("/api/assignments", assignmentRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
