const cloudinary = require("cloudinary").v2; //! Cloudinary is being required

exports.cloudinaryConnect = () => {
  try {
    // Support both naming conventions: CLOUD_NAME or CLOUDINARY_CLOUD_NAME
    const cloudName =
      process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.API_KEY || process.env.CLOUDINARY_API_KEY;
    const apiSecret =
      process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn(
        "Warning: Cloudinary credentials are not set. Image upload features will not work."
      );
      console.warn(
        "Please set either: CLOUD_NAME/API_KEY/API_SECRET or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET"
      );
      return;
    }

    cloudinary.config({
      //!    ########   Configuring the Cloudinary to Upload MEDIA ########
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log("Cloudinary connected successfully");
  } catch (error) {
    console.warn(
      "Warning: Failed to initialize Cloudinary. Image upload features will not work.",
      error.message
    );
  }
};
