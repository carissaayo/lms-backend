import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentsEnrolled: { type: Number, default: 0 },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },

    price: { type: String, required: true },
    image: {
      url: {
        type: String,
      },
      imageName: {
        type: String,
        unique: true,
      },

      caption: String,
    },
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
