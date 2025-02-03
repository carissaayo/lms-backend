import Course from "../models/Course.js";
import Quizz from "../models/Quizz.js";
import User from "../models/User.js";

// create Single course
export const registerForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!req.user.isVerified) {
      return res.status(401).json("You have not verified your email");
    }

    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "student",
    });

    if (!user) {
      return res
        .status(401)
        .json("Only verified students can reguster for a course");
    }

    const getAcourse = await Course.findById({ _id: courseId });
    if (!getAcourse) {
      return res.status(401).json({
        message: "Course isn't available",
      });
    }

    user.enrolledCourses.push(getAcourse);
    getAcourse.studentsEnrolled.push(user);

    await getAcourse.save();
    await user.save();

    return res.status(200).json({
      message: "you have successfully registered for the course",
      course: getAcourse,
    });
  } catch (error) {
    console.log("error registering for course", error);
    res.status(500).json({ message: "Course registration failed" });
  }
};

// get A Course
export const getSingleCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const isItDeleted = await Course.findOne({ _id: id, deleted: true });

    if (isItDeleted) {
      return res.status(401).json({
        message: "course has been deleted",
        isItDeleted,
      });
    }

    const getAcourse = await Course.findById({ _id: id });
    if (!getAcourse) {
      return res.status(401).json({
        message: "such course isn't available",
      });
    }
    return res.status(200).json({
      message: "course has been fecthed successfully",
      course: getAcourse,
    });
  } catch (error) {
    console.log("error fetching course", error);
    res.status(500).json({ message: "Course fecthing  failed" });
  }
};

// Take a quizz
export const takeQuizz = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(404).json({
        message: "no course id was provided",
      });
    }
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "student",
    });

    if (!user || user.role !== "student" || !user.isVerified) {
      return res.status(401).json({
        message: "only verified students can take quizz",
      });
    }

    const getCourse = await Course.findById({ _id: courseId });
    if (!getCourse) {
      return res.status(404).json({
        message: "such course isn't available",
      });
    }
    const getQuizz = await Quizz.findOne({ _id: id, deleted: false });

    console.log(getQuizz);

    if (!getQuizz) {
      return res.status(401).json({
        message: "quizz can't be found",
      });
    }

    if (getCourse.quizz.toString() !== id) {
      return res.status(404).json({
        message: "quizz not found in this course",
      });
    }

    getQuizz.interestedStudents.push(user);
    user.quizz.push(getQuizz);
    await getQuizz.save();
    await user.save();

    return res.status(200).json({
      message: "course has been fecthed successfully",
      quizz: getQuizz,
      user: user,
    });
  } catch (error) {
    console.log("error taking course", error);
    res.status(500).json({ message: "Quizz taking failed" });
  }
};
