import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  instructor: { type: String, required: true },
  studentsEnrolled: { type: Number, default: 0 },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  price: { type: String, required: true },
  image: {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    caption: String,
  },
  deleted: { type: Boolean, default: false },
});

const User = mongoose.model("Course", courseSchema);

export default User;
