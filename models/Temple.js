const mongoose = require("mongoose");

const TempleSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, "Temple name is required"],
    trim:     true,
  },
  slug: {
    type:   String,
    unique: true,
  },
  deity: {
    type:     String,
    required: true,
  },
  deityColor: String,
  type:       String,

  description: String,
  history:     String,

  city: String,
  address: String,

  district: {
    type:     String,
    required: true,
  },
  state: {
    type:     String,
    required: true,
  },

  website: String,

  timings: {
    morning: String,
    evening: String,
  },
  aartiTimings: {
    type: Map,
    of:   String,
  },
  districtCover: {
  type: Boolean,
  default: false,
},

  facilities:    [String],
  nearbyTemples: [String],
  festivals:     [String],

  images: [String],

 coordinates: {
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
},

  rating: {
    type:    Number,
    default: 0,
    min:     0,
    max:     5,
  },
  reviews: {
    type:    Number,
    default: 0,
  },

  isActive: {
    type:    Boolean,
    default: true,
  },
}, { timestamps: true });

// -- Auto slug generate --
TempleSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };
});

// -- Search Index --
TempleSchema.index({
  name:     "text",
  deity:    "text",
  district: "text",
  state:    "text",
  type:     "text",
});

module.exports = mongoose.model("Temple", TempleSchema);
