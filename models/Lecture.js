import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      required: true,
    },
    caption: String,
  },
  length: {
    type: Number,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
