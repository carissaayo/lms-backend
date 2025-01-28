import mongoose from "mongoose";

const quizzSchema = new mongoose.Schema({
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
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
});

const Quizz = mongoose.model("QuizzSchema", quizzSchema);

export default Quizz;
