import { Document, Types } from "mongoose";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";

interface IUser extends Document {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = (user as unknown as IUser).generateAccessToken();
    const refreshToken = (user as unknown as IUser).generateRefreshToken();
    if (user) {
      user.refreshToken = refreshToken;
    }
    await user?.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password, contactNo, gender, mode } = req.body;

  if ([fullName, email, password, contactNo].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { contactNo }],
  });

  if (existedUser) {
    throw new ApiError(400, "User with email or contact no  already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    contactNo,
    gender,
    mode,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, contactNo, password } = req.body;
  if (!email && !contactNo) {
    throw new ApiError(400, "Credentials are required");
  }

  const user = (await User.findOne({
    $or: [{ email }, { contactNo }],
  })) as IUser;

  if (!user) {
    throw new ApiError(400, "Credentials are required");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in sucessfully"
      )
    );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    req.(user)._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async(req: Request, res: Response)=>{
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"))
})

export { registerUser, loginUser, logoutUser };
