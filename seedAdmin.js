// Run with: node seedAdmin.js
// Creates (or upgrades) an admin user so you can log into the Admin Panel.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const ADMIN_NAME     = "Admin";
const ADMIN_EMAIL    = "admin@tirthsthal.com";
const ADMIN_PASSWORD = "Admin@123"; // change after first login

(async () => {
  await connectDB();

  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    user.role = "admin";
    user.isVerified = true;
    await user.save();
    console.log(`Existing user upgraded to admin: ${ADMIN_EMAIL}`);
  } else {
    user = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      isVerified: true,
    });
    console.log(`Admin user created!`);
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
  }

  await mongoose.connection.close();
  process.exit(0);
})();
