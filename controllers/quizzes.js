import Course from "../models/Course.js";
import Quizz from "../models/Quizz.js";
import User from "../models/User.js";

export const createQuizz = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "instructor",
    });

    if (!user) {
      return res
        .status(401)
        .json(
          "Access Denied, you don't have the permission to create a lecture"
        );
    }

    // is the course available and not deleted
    const validCourse = await Course.findOne({
      _id: courseId,
      deleted: false,
    });
    if (!validCourse) {
      return res.status(401).json("Course can't be found");
    }

    if (!req.body) {
      return res.status(401).json({ message: "No data was provided" });
    }

    console.log(req.body);

    const newData = {
      instructor: req.user.id,
      course: courseId,
      description: req.body.description,
      title: req.body.title,
      questions: req.body.questions,
    };
    console.log(newData);

    const newQuizz = new Quizz(newData);
    validCourse.quizz = newQuizz;

    await newQuizz.save();
    await validCourse.save();
    return res.status(200).json({
      message: "Quizz has been created successfully",
      quizz: newQuizz,
    });
  } catch (error) {
    console.log("error creating quizz", error);
    res.status(500).json({ message: "Quizz creation  failed" });
  }
};
