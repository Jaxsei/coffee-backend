import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1.Get user details from frontend
  // 2.check validation -  not empty
  // 3.check if user already exists: username, email
  // 4.check for images and avatar
  // 5.upload them to cloudinary
  // 6.create user object - create entry in db
  // 7.remove password and refreshToken field from response
  // 8.check for user creation
  // 9.return response



  // 1.Get user details from frontend
  const { fullname, email, username, password } = req.body;
  console.log(email)



  // 2.check validation -  not empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  if(password >= 8){
    throw new ApiError(400, "Password must be longer than 8 characters")
  }

  // 3.check if user already exists: username, email
  const existedUser = User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }



  // 4.check for images and avatar
  const avatarImageLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarImageLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }



  // 5.upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarImageLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }



  // 6.create user object - create entry in db
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })



  // 7.remove password and refreshToken field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )



  // 8.check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }



  // 9. return response
  return res.status(202).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )
})

export { registerUser }
