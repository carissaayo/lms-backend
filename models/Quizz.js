import mongoose from "mongoose";
import questionSchema from "./Question.js";

const quizzSchema = new mongoose.Schema(
  {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const Quizz = mongoose.model("QuizzSchema", quizzSchema);

export default Quizz;
