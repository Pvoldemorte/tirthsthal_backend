const mongoose = require("mongoose");

const DeitySchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  slug:           { type: String, unique: true },
  alternateNames: String,
  description:    { type: String, required: true },
  origin:         String,
  category:       String,
  associatedTemple: String,
  image:          String,
  color:          { type: String, default: "#f4a261" },
  filterKey:      String,
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

DeitySchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  if (!this.filterKey) this.filterKey = this.name;
  next();
});

module.exports = mongoose.model("Deity", DeitySchema);