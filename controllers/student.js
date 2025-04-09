import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Quizz from "../models/Quizz.js";
import User from "../models/User.js";
import { uploadDocs } from "./fileUpload.js";

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

    const getAcourse = await Course.findOne({
      _id: courseId,
      isPublished: true,
    });
    if (!getAcourse) {
      return res.status(401).json({
        message: "Course isn't available",
      });
    }

    user.enrolledCourses.push(getAcourse);
    // To track course progress
    if (!user.completedLectures) {
      user.completedLectures = {};
    }
    user.completedLectures[courseId] = [];

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

// get Student course, assignments and quizzes
export const getStudentDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({
        message: "You are not allowed",
      });
    }
    const student = await User.findOne({
      _id: userId,
      deleted: false,
      role: "student",
    })
      .populate("enrolledCourses")
      .populate("assignments")
      .populate("quizz")
      .exec();

    if (!student) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "student details has been fecthed successfully",
      student,
    });
  } catch (error) {
    console.log("error fetching course", error);
    res.status(500).json({ message: "Course fecthing  failed" });
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

    if (!user.courses.includes(courseId)) {
      return res.status(404).json({
        message: "You didn't register for the course",
      });
    }

    const getCourse = await Course.findById({ _id: courseId });
    if (!getCourse) {
      return res.status(404).json({
        message: "such course isn't available",
      });
    }
    const getQuizz = await Quizz.findOne({ _id: id, deleted: false });

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
    if (getQuizz.interestedStudents.includes(user._id)) {
      return res.status(401).json({
        message: "you can't take a quizz more than once",
      });
    }
    getQuizz.interestedStudents.push(user);
    user.quizz.push(getQuizz);
    await getQuizz.save();
    await user.save();

    return res.status(200).json({
      message: "course has been fecthed successfully",
      quizz: getQuizz,
    });
  } catch (error) {
    console.log("error taking course", error);
    res.status(500).json({ message: "Quizz taking failed" });
  }
};

export const submitQuizz = async (req, res) => {
  try {
    const { id } = req.params;

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

    const getQuizz = await Quizz.findOne({ _id: id, deleted: false });

    if (!getQuizz) {
      return res.status(404).json({
        message: "quizz can't be found",
      });
    }

    if (
      user.quizz.filter((q) => q._id.toString() === getQuizz._id.toString())
        ?.totalScore > 0
    ) {
      return res.status(401).json({
        message: "you have already attempted the quizz",
      });
    }

    const { answers } = req.body;

    let totalScore = 0;

    answers.forEach((answer) => {
      const question = getQuizz.questions.find((q) =>
        q._id.equals(answer.questionId)
      );
      if (!question) {
        return res.status(404).json({
          message: "question could not be found",
        });
      }

      if (question) {
        if (question.correctAnswer === answer.chosenAnswer) {
          totalScore += question.points;
        }
      }
    });

    user.quizz = user.quizz.map((q) => {
      if (q._id.toString() === getQuizz._id.toString()) {
        return { ...q, totalScore };
      }
      return q;
    });
    await user.save();

    return res.status(200).json({
      message: "Quizz has been submitted successfully",
      score: totalScore,
    });
  } catch (error) {
    console.log("error taking course", error);
    res.status(500).json({ message: "Quizz taking failed" });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "student",
    });

    if (!user || user.role !== "student" || !user.isVerified) {
      return res.status(401).json({
        message: "only verified students can take assignments",
      });
    }

    // is the assignment available and not deleted
    const getAssignment = await Assignment.findOne({
      _id: assignmentId,
      deleted: false,
    });
    if (!getAssignment) {
      return res.status(404).json("Assignment not found");
    }

    if (user.assignments.includes(assignmentId)) {
      return res.status(401).json("You have already submitted this assignment");
    }

    const upload = await uploadDocs(req, res, req.file);

    console.log(upload);
    const uploadData = upload.file;
    const student = {
      studentId: uploadData.uploader,
      submittedFileId: uploadData._id,
      fileFolder: uploadData.fileFolder,
    };
    getAssignment.interestedStudents.push(student);
    user.assignments.push(assignmentId);

    await getAssignment.save();
    await user.save();

    return res.status(200).json({
      message: "Assignment submitted successfully",
    });
  } catch (error) {
    console.log("error submitting assignment", error);
    res.status(500).json({ message: "Assignment  failed" });
  }
};

export const addCompletedLecture = async (req, res) => {
  const { lectureId } = req.params;
  const { courseId } = req.body;

  try {
    const student = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "student",
    });

    if (!student || student.role !== "student" || !student.isVerified) {
      return res.status(401).json({
        message: "you are not authorized",
      });
    }
    if (!courseId) {
      return res.status(404).json({ message: "Course Id is required" });
    }
    const course = await Course.findById(courseId);
    console.log(course);

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Initialize if not existing
    if (!student.completedLectures[courseId]) {
      student.completedLectures[courseId] = [];
    }

    // Add lectureId only if it's not already marked
    if (!student.completedLectures[courseId].includes(lectureId)) {
      student.completedLectures[courseId].push(lectureId);
      await student.save();
    }

    // Calculate progress
    const totalLectures = course.lectures.length;
    const completed = student.completedLectures[courseId].length;
    const progress = totalLectures > 0 ? (completed / totalLectures) * 100 : 0;

    return res.status(200).json({
      message: "Lecture marked as completed",
      progress: Math.round(progress),
      totalLectures,
      completedLectures: completed,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Marking lecture completed failed" });
  }
};
