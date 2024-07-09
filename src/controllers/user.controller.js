import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong While Gererating Refresh Token and Access Token",
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;
  console.log("fullname : ", fullName);

  // Check kar rahe hain agar koi field empty hai
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Check kar rahe hain agar avatar file present hai ya nahi
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  try {
    // Avatar ko Cloudinary par upload kar rahe hain
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : null;

    if (!avatar) {
      throw new ApiError(400, "Failed to upload avatar");
    }

    // User create kar rahe hain database me
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    // User ko fetch kar rahe hain without password aur refreshToken ke
    const createUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );
    if (!createUser) {
      throw new ApiError(400, "Failed to create user");
    }

    // Response return kar rahe hain successful user creation ke baad
    return res
      .status(201)
      .json(new ApiResponse(201, createUser, "User created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message); // Error handle kar rahe hain
  }
});

const loginUser = asyncHandler(async (req, res) => {
  /* 
   1- get username or email and password from the frontend
   2- check if username or email exists in the database
   3- check if password is correct
   4- if correct, generate a token and send it to the frontend
   5- if not correct, send error message to the frontend

   */
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username and email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "Invalid username or email");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const [accessToken, refreshToken] = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = User.findById(user._id).select(
    "-password -refreshToken",
  );

  // send cookies form frontend
  const option = {
    httpOnly: true,
    secure: true,
  };

  return res.status
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiError(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req , res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined,
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200, {}, "User logged Out"))

})
export { registerUser, loginUser, logoutUser};