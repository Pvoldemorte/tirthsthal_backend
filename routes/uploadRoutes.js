const express = require("express");
const router  = express.Router();
const upload  = require("../middleware/upload");
const { uploadImages, deleteImage } = require("../controllers/uploadController");
const { protect, adminOnly } = require("../middleware/auth");

// POST /api/upload  -> field name "images" (supports multiple files)
router.post("/", protect, adminOnly, upload.array("images", 10), uploadImages);
router.delete("/", protect, adminOnly, deleteImage);

module.exports = router;
