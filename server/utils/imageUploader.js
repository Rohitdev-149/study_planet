const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  try {
    // Validate file object
    if (!file) {
      throw new Error("File object is required");
    }

    const options = { folder };
    if (height) {
      options.height = height;
    }
    if (quality) {
      options.quality = quality;
    }
    options.resource_type = "auto";

    let uploadResult;

    // Check if file has tempFilePath (when useTempFiles: true)
    if (file.tempFilePath) {
      // Verify the temp file exists
      if (!fs.existsSync(file.tempFilePath)) {
        throw new Error(`Temporary file not found at: ${file.tempFilePath}`);
      }

      // File is saved to temp directory
      uploadResult = await cloudinary.uploader.upload(
        file.tempFilePath,
        options
      );
    }
    // Check if file has data buffer (when useTempFiles: false or fallback)
    else if (file.data && Buffer.isBuffer(file.data)) {
      // File is in memory as buffer - use upload stream
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(file.data);
      });
    }
    // Check if file.mv is available (express-fileupload method)
    else if (file.mv) {
      // Create a temporary file path
      const os = require("os");
      const tmpDir = os.tmpdir();
      const tmpFilePath = path.join(
        tmpDir,
        `${Date.now()}-${file.name || "upload"}`
      );

      // Move file to temp location
      await file.mv(tmpFilePath);

      // Upload from temp file
      uploadResult = await cloudinary.uploader.upload(tmpFilePath, options);

      // Clean up temp file
      try {
        fs.unlinkSync(tmpFilePath);
      } catch (cleanupError) {
        console.warn("Could not delete temporary file:", cleanupError);
      }
    } else {
      console.error("File object structure:", {
        hasTempFilePath: !!file.tempFilePath,
        hasData: !!file.data,
        hasMv: !!file.mv,
        keys: Object.keys(file),
      });
      throw new Error(
        "Invalid file format. File must have tempFilePath, data buffer, or mv method."
      );
    }

    return uploadResult;
  } catch (error) {
    console.error("Error in uploadImageToCloudinary:", error);
    console.error(
      "File object:",
      file
        ? {
            name: file.name,
            size: file.size,
            mimetype: file.mimetype,
            hasTempFilePath: !!file.tempFilePath,
            hasData: !!file.data,
          }
        : "null"
    );
    throw error;
  }
};
