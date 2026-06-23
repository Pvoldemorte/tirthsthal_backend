const express = require("express");
const router  = express.Router();
const {
  register, login, getProfile,
  updateProfile, logout, forgotPassword, resetPassword,
  changePassword, updateSettings, deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register",       register);
router.post("/login",          login);
router.get( "/profile",        protect, getProfile);
router.put( "/profile",        protect, updateProfile);
router.put( "/change-password",protect, changePassword);
router.put( "/settings",       protect, updateSettings);
router.delete("/account",      protect, deleteAccount);
router.post("/logout",         protect, logout);
router.post("/forgot-password",             forgotPassword); // ✅ add
router.post("/reset-password/:token",       resetPassword)



module.exports = router;