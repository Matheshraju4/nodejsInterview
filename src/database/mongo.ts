import mongoose from "mongoose";
import { SignInForm, UserDetails } from "./types";
mongoose.connect("mongodb://localhost:27017/userdetails");
const { Schema, model } = mongoose;

const UserDetails = new Schema({
  name: String,
  email: String,
  phoneNumber: String,
  password: String,
  imageUrl: String,
  isVerified: {
    email: {
      otp: { type: Boolean, default: false },
      actualOtp: { type: String },
    },
    phoneNumber: { type: Boolean, default: false },
  },
});
const User = model("UserDetails", UserDetails);

export async function signUp(data: UserDetails, otp: string) {
  const response = await User.create({
    name: data.name,
    email: data.email,
    phoneNumber: data.phoneNumber,
    imageUrl: data.imageUrl,
    password: data.password,
    isVerified: {
      email: {
        actualOtp: otp,
      },
    },
  });

  return response;
}

export async function signIn(data: SignInForm) {
  const response = await User.findOne({
    phoneNumber: data.phoneNumber,
    password: data.password,
  });
  return response;
}
export async function getAll() {
  const response = await User.find();
  return response;
}

// Adjust the import path according to your project structure

export async function verifyEmail(email: string, otp: string) {
  try {
    const user = await User.findOne({ email: email });

    if (user?.isVerified?.email?.actualOtp === otp) {
      const updatedUser = await User.updateOne(
        { email: email },
        { $set: { "isVerified.email.otp": true } }
      );

      return {
        success: true,
        message: "Email verified successfully",
        updatedUser,
      };
    } else {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred during email verification",
      error: error,
    };
  }
}
