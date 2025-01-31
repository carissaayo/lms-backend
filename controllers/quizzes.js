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
        .json("Access Denied, you don't have the permission to create a quizz");
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

    const newData = {
      instructor: req.user.id,
      course: courseId,
      description: req.body.description,
      title: req.body.title,
      questions: req.body.questions,
    };

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

export const updateQuizz = async (req, res) => {
  try {
    const { quizzId } = req.params;

    // is the quizz available and not deleted
    const validQuizz = await Quizz.findOne({
      _id: quizzId,
      deleted: false,
    });
    if (!validQuizz) {
      return res.status(404).json("Quizz can't be found");
    }

    if (req.user.id !== validQuizz.instructor.toString()) {
      return res
        .status(401)
        .json(
          "Access Denied, you don't have the permission to update this quizz"
        );
    }

    if (!req.body) {
      return res.status(401).json({ message: "No data was provided" });
    }

    const { description, title, questions } = req.body;

    const quizzUpdated = await Quizz.findByIdAndUpdate(
      quizzId,
      { $set: { title, description, questions } },
      { new: true }
    );

    return res.status(200).json({
      message: "Quizz has been updated successfully",
      quizz: quizzUpdated,
    });
  } catch (error) {
    console.log("error updating quizz", error);
    res.status(500).json({ message: "Quizz updating failed" });
  }
};

export const getSingleQuizz = async (req, res) => {
  try {
    const { quizzId } = req.params;

    // is the quizz available and not deleted
    const validQuizz = await Quizz.findOne({
      _id: quizzId,
      deleted: false,
    });
    if (!validQuizz) {
      return res.status(404).json("Quizz not found");
    }

    return res.status(200).json({
      message: "Quizz has been created successfully",
      quizz: validQuizz,
    });
  } catch (error) {
    console.log("error fetching quizz", error);
    res.status(500).json({ message: "Quizz fetching  failed" });
  }
};

export const getQuizzesByAnInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (req.user.id !== instructorId && !req.user.isAdmin) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }
    // is the quizz available and not deleted
    const validQuizzes = await Quizz.find({
      instructor: instructorId,
      deleted: false,
    });

    if (!validQuizzes) {
      return res.status(404).json("Quizzes not found");
    }

    return res.status(200).json({
      message: "Quizzes has been created successfully",
      quizz: validQuizzes,
    });
  } catch (error) {
    console.log("error fetching quizzes", error);
    res.status(500).json({ message: "Quizzes fetching  failed" });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      isAdmin: req.user.isAdmin,
    });

    if (!user) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }

    // is the quizz available and not deleted
    const validQuizzes = await Quizz.find({
      deleted: false,
    });
    if (!validQuizzes) {
      return res.status(401).json("Quizzes not found");
    }

    return res.status(200).json({
      message: "Quizzes has been created successfully",
      quizz: validQuizzes,
    });
  } catch (error) {
    console.log("error fetching quizzes", error);
    res.status(500).json({ message: "Quizzes fetching  failed" });
  }
};

export const deleteSingleQuizz = async (req, res) => {
  try {
    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "instructor" || "moderator",
    });

    if (!user) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }

    const { id } = req.params;

    // is the course available and not deleted
    const validQuizz = await Quizz.findOne({
      _id: id,
      instructor: req.user.id,
      deleted: false,
    });

    if (!validQuizz) {
      return res.status(401).json("quizz does not exist");
    }

    await Quizz.findByIdAndUpdate(id, { deleted: true }, { new: true });
    return res.status(200).json({
      message: "quizz deleted successfully",
    });
  } catch (error) {
    console.log("error deleting quizz", error);
    res.status(500).json({ message: "Quizz deletion failed" });
  }
};

export const deleteQuizzesByAnInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (req.user.id !== instructorId && !req.user.isAdmin) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }

    // is the course available and not deleted
    const deleteQuizzes = await Quizz.updateMany(
      {
        instructor: instructorId,
        deleted: false,
      },
      { $set: { deleted: true } },
      { new: true }
    );

    if (deleteQuizzes.modifiedCount === 0) {
      return res.status(404).json("quizzes do not exist");
    }

    return res.status(200).json({
      message: "quizzes deleted successfully",
    });
  } catch (error) {
    console.log("error deleting quizzes", error);
    res.status(500).json({ message: "Quizzes deletion failed" });
  }
};
