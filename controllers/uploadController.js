const cloudinary = require("../config/cloudinary");

// Helper: upload a single buffer to Cloudinary using upload_stream
const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder || "tirthsthal", resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// -- Upload one or more images to Cloudinary --
exports.uploadImages = async (req, res, next) => {
  try {
    const folder = req.body.folder || "tirthsthal";

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    const uploadResults = await Promise.all(
      req.files.map((file) => streamUpload(file.buffer, folder))
    );

    const images = uploadResults.map((result) => ({
      url:       result.secure_url,
      publicId:  result.public_id,
    }));

    res.status(200).json({
      success: true,
      images,
      // Convenience: plain array of URLs for easy saving on the model
      urls: images.map((img) => img.url),
    });
  } catch (error) {
    next(error);
  }
};

// -- Delete an image from Cloudinary by its public_id --
exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "publicId is required",
      });
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({ success: true, message: "Image deleted" });
  } catch (error) {
    next(error);
  }
};
