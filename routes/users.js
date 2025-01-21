import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
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
