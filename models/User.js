import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    completedLectures: {
      type: Object,
      default: {},
    },
    progress: {
      type: Object,
      default: {},
    },
    avatar: {
      url: { type: String },
    },
    deleted: { type: Boolean, default: false },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["instructor", "student", "moderator"],
      default: "student",
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    quizz: [
      {
        quizzId: { type: mongoose.Schema.Types.ObjectId, ref: "Quizz" },
        totalScore: { type: Number, default: 0 },
      },
    ],
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        score: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
