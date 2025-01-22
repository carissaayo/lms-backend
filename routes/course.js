import Course from "../models/Course.js";
import User from "../models/User.js";

// create Single course
export const createCourse = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, deleted: false });

    if (!user) {
      res
        .status(401)
        .json("Access Denied, you need to be logged in to create courses");
    }

    const data = req.body;

    const instructor = user.id;
    const newCourse = new Course({ ...data, instructor });
    const addCourse = user.courses.push(newCourse);

    await newCourse.save();
    await user.save();

    res.status(200).json({
      message: "course has been created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.log("error creating course", error);
    res.status(500).json({ message: "Course creation  failed" });
  }
};

// get A Course
export const getSingleCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const isItDeleted = await Course.find({ _id: id, deleted: true });

    if (isItDeleted.title) {
      res.status(401).json({
        message: "course has been deleted",
        isItDeleted,
      });
    }

    const getAcourse = await Course.findById({ _id: id });
    if (!getAcourse) {
      res.status(401).json({
        message: "such course isn't available",
      });
    }
    res.status(200).json({
      message: "course has been fecthed successfully",
      course: getAcourse,
    });
  } catch (error) {
    console.log("error fetching course", error);
    res.status(500).json({ message: "Course fecthing  failed" });
  }
};

// get All Courses Available
export const getAllCoursesAvailable = async (req, res) => {
  try {
    const courses = await Course.find({ deleted: false });

    res.status(200).json({
      message: "All courses has been fetched successfully",
      courses,
    });
  } catch (error) {
    console.log("error fetching all courses", error);
    res.status(500).json({ message: "Course fetching  failed" });
  }
};

// get all the courses by a single instructor
export const getAllCoursesByAnInstructor = async (req, res) => {
  try {
    const { instructor } = req.params;

    // Is the instructor deleted
    const isTheInstructorDeleted = await User.find({
      _id: instructor,
      deleted: true,
    });
    if (isTheInstructorDeleted.name) {
      return res.status(401).json({
        message: "Instructor can't be found",
        isTheInstructorDeleted,
      });
    }

    const courses = await Course.find({
      instructor: instructor,
      deleted: false,
    });

    res.status(200).json({
      message: "All courses has been fetched successfully",
      courses,
    });
  } catch (error) {
    console.log("error fetching all courses", error);
    res.status(500).json({ message: "Course fetching  failed" });
  }
};

// update a course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    //has the course been deleted
    const deletedCourse = await Course.find({ _id: id, deleted: true });

    if (deletedCourse) {
      return res.status(401).json({
        message: "course has been deleted",
        course: deletedCourse,
      });
    }
    const existingCourse = await Course.find({ _id: id, deleted: false });

    if (!existingCourse) {
      return res.status(400).json("Course not found");
    }

    if (existingCourse?.instructor !== req.user.id) {
      return res
        .status(401)
        .json("Access Denied, you can only update your course");
    }

    const newData = req.body;
    const updatedCourse = await Course.findByIdAndUpdate(id, newData, {
      new: true,
    });
    console.log(updatedCourse);
    res.status(200).json({
      message: "course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.log("error updating course", error);
    res.status(500).json({ message: "Updating course failed" });
  }
};

// delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    //has the course been deleted
    const deletedCourse = await Course.find({ _id: id, deleted: true });

    if (deletedCourse[0]?.title) {
      return res.status(401).json({
        message: "course has already been deleted",
      });
    }

    const existingCourse = await Course.find({ _id: id, deleted: false });

    if (!existingCourse[0]) {
      return res.status(400).json("course not found");
    }
    if (existingCourse[0]?.instructor.toString() !== req.user.id) {
      return res
        .status(401)
        .json("Access Denied, you can only delete your course");
    }

    // deleted a course
    const deleteCourse = await Course.findByIdAndUpdate(
      { _id: id },
      { deleted: true },
      { new: true }
    );

    res.status(200).json({
      message: "course account has been deleted successfully",
    });
  } catch (error) {
    console.log("unable to delete course", error);
    res.status(500).json({ message: "Deleting course failed" });
  }
};

export const deleteCoursesByAnInstructor = async (req, res) => {
  try {
    const { instructor } = req.params;

    if (instructor !== req.user.id) {
      return res
        .status(401)
        .json("Access Denied, you can only delete your courses");
    }

    const courses = await Course.deleteMany({ instructor: instructor });
    console.log(courses);

    res.status(200).json({
      message: "courses  has been deleted successfully",
    });
  } catch (error) {
    console.log("unable to delete courses", error);
    res.status(500).json({ message: "Deleting courses failed" });
  }
};
