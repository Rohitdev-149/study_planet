const cloudinary = require("cloudinary").v2;
const catchAsync = require("../utils/catchAsync");

/**
 * Generate Secure Cloudinary Presigned Signatures
 * Offloads massive file stream processing from Express thread to direct browser-Cloudinary pathways.
 */
exports.getCloudinarySignature = catchAsync(async (req, res, next) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Set upload settings matching backend storage strategies
  const uploadParams = {
    timestamp: timestamp,
    folder: process.env.COURSE_THUMBNAIL_FOLDER || "StudyPlanet",
  };

  // Cryptographically sign upload options with the private Cloudinary API Secret
  const signature = cloudinary.utils.api_sign_request(
    uploadParams,
    process.env.CLOUDINARY_API_SECRET
  );

  return res.status(200).json({
    success: true,
    message: "Presigned Cloudinary upload parameters generated successfully",
    data: {
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: process.env.COURSE_THUMBNAIL_FOLDER || "StudyPlanet",
    },
  });
});
