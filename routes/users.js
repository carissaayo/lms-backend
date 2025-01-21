import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import User from "../models/User.js";
import { response } from "express";
// create user
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json("Email already in use");
    }
    // Bcrypt
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = new User({ email, name, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User created successfully" });
  } catch (error) {
    console.log("error registering user", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    // Incorrect email
    if (!existingUser) {
      return res
        .status(401)
        .json({ message: "no user can be found with this email" });
    }

    // compare password
    const isPasswordCorrect = bcrypt.compareSync(
      password,
      existingUser.password
    );
    // Incorrect Password
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "incorrect password" });
    }
    const user = {
      email,
      name: existingUser.name,
      id: existingUser._id,
    };

    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(user, secretKey, { expiresIn: "1d" });

    res.status(200).json({
      message: "welcome back",
      token,
      user,
    });
  } catch (error) {
    console.log("unable to login user", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// logout user
export const logoutUser = async (req, res) => {
  try {
    //clear the token from cookies
    res.clearCookie("token");

    res.status(200).json({
      message: "You have been logged out",
    });
  } catch (error) {
    console.log("unable to logout user", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

// get a user
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existingUser = await User.findById({ _id: id });

    if (!existingUser) {
      return res.status(400).json("User not found");
    }
    const { password, ...userDetails } = existingUser._doc;

    res.status(200).json({
      message: "User details fetched successfully",
      userDetails,
    });
  } catch (error) {
    console.log("error fetching user", error);
    res.status(500).json({ message: "Fetching user failed" });
  }
};

// get a user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      message: "All users fetched successfully",
      users,
    });
  } catch (error) {
    console.log("error fetching  all users", error);
    res.status(500).json({ message: "Fetching all users failed" });
  }
};

// update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const existingUser = await User.findById({ _id: id });

    if (!existingUser) {
      return res.status(400).json("User not found");
    }

    if (id !== req.user.id) {
      return res
        .status(401)
        .json("Access Denied, you can only update your account");
    }

    const { email, name } = req.body;
    if (req.body.email) {
      // Check if the new email has been used already
      const checkEmailAvailability = await User.findOne({ email });
      if (checkEmailAvailability) {
        return res.status(401).json("Email has been used already");
      }
    }

    if (req.body.name) {
      // Check if the new email has been used already
      const checkNameAvailability = await User.findOne({ name });
      if (checkNameAvailability) {
        return res.status(401).json("Name has been used already");
      }
    }
    const newData = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, newData, {
      new: true,
    });
    console.log(updatedUser);
    res.status(200).json({
      message: "user details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("error updating user", error);
    res.status(500).json({ message: "Updating user failed" });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existingUser = await User.findByIdAndDelete({ _id: id });

    if (!existingUser) {
      return res.status(400).json("User not found");
    }

    if (id !== req.user.id) {
      return res
        .status(401)
        .json("Access Denied, you can only delete your account");
    }

    res.status(200).json({
      message: "user account has been deleted successfully",
    });
  } catch (error) {
    console.log("unable to delete user", error);
    res.status(500).json({ message: "Deleting user failed" });
  }
};
