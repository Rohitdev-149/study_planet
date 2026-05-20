const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  // express-fileupload creates a temp file path on disk when useTempFiles=true
  // property name may be tempFilePath (common) or tempfilePath depending on versions
  const filePath =
    file && (file.tempFilePath || file.tempfilePath || file.path || null);

  if (!filePath) {
    // If file.buffer/data is available, Cloudinary can accept a buffer via upload_stream.
    // For simplicity, throw a helpful error so caller can log the received `file` object.
    throw new Error(
      "No temporary file path found on uploaded file. Received file keys: " +
        JSON.stringify(Object.keys(file || {}))
    );
  }

  const options = { folder };
  if (height) {
    options.height = height;
    options.crop = "scale";
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";

  return await cloudinary.uploader.upload(filePath, options);
};
