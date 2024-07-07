import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiError} from "../utils/ApiError.js"; 
import {User} from "../models/user.model.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
   const { fullName, username, email, password } = req.body;
   console.log('fullname : ', fullName);

   // Check kar rahe hain agar koi field empty hai
   if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
   }

   const avatarLocalPath = req.files?.avatar?.[0]?.path;
   // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

   let coverImageLocalPath;

   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath=req.files.coverImage[0].path
   }

   // Check kar rahe hain agar avatar file present hai ya nahi
   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
   }

   try {
      // Avatar ko Cloudinary par upload kar rahe hain
      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

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
         username: username.toLowerCase()
      });

      // User ko fetch kar rahe hain without password aur refreshToken ke
      const createUser = await User.findById(user._id).select("-password -refreshToken");
      if (!createUser) {
         throw new ApiError(400, "Failed to create user");
      }

      // Response return kar rahe hain successful user creation ke baad
      return res.status(201).json(
         new ApiResponse(201, createUser, "User created successfully")
      );
   } catch (error) {
      throw new ApiError(500, error.message); // Error handle kar rahe hain
   }
});

export { registerUser };
