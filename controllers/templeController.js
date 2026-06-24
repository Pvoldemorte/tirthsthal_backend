const Temple   = require("../models/Temple");
const District = require("../models/District");

// ── Helper: auto-create/update district ──
const syncDistrict = async (districtName, state, templeImage) => {
  if (!districtName || !state) return;
  const slug = districtName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const existing = await District.findOne({ name: new RegExp(`^${districtName}$`, "i") });
  if (!existing) {
    await District.create({ name: districtName, state, slug, image: templeImage || "" });
  } else if (!existing.image && templeImage) {
    await District.findByIdAndUpdate(existing._id, { image: templeImage });
  }
};

// ── Helper: update district temple count ──
const updateDistrictCount = async (districtName) => {
  if (!districtName) return;
  const count = await Temple.countDocuments({
    district: new RegExp(`^${districtName}$`, "i"),
    isActive: true,
  });
  await District.findOneAndUpdate(
    { name: new RegExp(`^${districtName}$`, "i") },
    { templeCount: count }
  );
};

// ── Get All Temples ──
exports.getAllTemples = async (req, res, next) => {
  try {
    const { search, state, district, deity, type, sort, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search)   query.$text    = { $search: search };
    if (state    && state    !== "All States")    query.state    = state;
    if (district && district !== "All Districts") query.district = district;
    if (deity    && deity    !== "All Deities")   query.deity    = new RegExp(deity, "i");
    if (type     && type     !== "All Types")     query.type     = new RegExp(type,  "i");

    let sortBy = "-createdAt";
    if (sort === "Name A-Z") sortBy = "name";
    if (sort === "Name Z-A") sortBy = "-name";
    if (sort === "Rating")   sortBy = "-rating";

    const skip  = (page - 1) * limit;
    const total = await Temple.countDocuments(query);
    const temples = await Temple.find(query).sort(sortBy).skip(skip).limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), totalPages: Math.ceil(total / limit), temples });
  } catch (error) { next(error); }
};

// ── Get Temple by Slug ──
exports.getTempleBySlug = async (req, res, next) => {
  try {
    const temple = await Temple.findOne({ slug: req.params.slug });
    if (!temple) return res.status(404).json({ success: false, message: "Temple not found" });

    const templeObj = temple.toObject();
    if (templeObj.nearbyTemples?.length) {
      const nearbyDocs = await Temple.find({
        name: { $in: templeObj.nearbyTemples },
        _id:  { $ne: temple._id },
      }).select("name slug images district state");
      templeObj.nearby = nearbyDocs.map((t) => ({
        name: t.name, slug: t.slug,
        image: t.images?.[0] || "/images/placeholder-temple.jpg",
        distance: "-",
      }));
    } else {
      templeObj.nearby = [];
    }
    res.status(200).json({ success: true, temple: templeObj });
  } catch (error) { next(error); }
};

// ── Create Temple ──
exports.createTemple = async (req, res, next) => {
  try {
    const temple = await Temple.create(req.body);
    const firstImage = req.body.images?.[0] || "";
    await syncDistrict(req.body.district, req.body.state, firstImage);
    await updateDistrictCount(req.body.district);
    res.status(201).json({ success: true, temple });
  } catch (error) { next(error); }
};

// ── Update Temple ──
exports.updateTemple = async (req, res, next) => {
  try {
    const temple = await Temple.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!temple) return res.status(404).json({ success: false, message: "Temple not found" });
    const firstImage = temple.images?.[0] || "";
    await syncDistrict(temple.district, temple.state, firstImage);
    await updateDistrictCount(temple.district);
    res.status(200).json({ success: true, temple });
  } catch (error) { next(error); }
};

// ── Delete Temple ──
exports.deleteTemple = async (req, res, next) => {
  try {
    const temple = await Temple.findByIdAndDelete(req.params.id);
    if (!temple) return res.status(404).json({ success: false, message: "Temple not found" });
    await updateDistrictCount(temple.district);
    res.status(200).json({ success: true, message: "Temple permanently deleted" });
  } catch (error) { next(error); }
};

// ── Search Suggestions ──
exports.searchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(200).json({ success: true, suggestions: [] });
    const temples = await Temple.find({
      $or: [
        { name:     new RegExp(q, "i") },
        { deity:    new RegExp(q, "i") },
        { district: new RegExp(q, "i") },
        { type:     new RegExp(q, "i") },
      ],
      isActive: true,
    }).select("name slug deity district state type images").limit(8);
    res.status(200).json({ success: true, suggestions: temples });
  } catch (error) { next(error); }
};

// ── Favorites ──
exports.addToFavorites = async (req, res, next) => {
  try {
    const User     = require("../models/User");
    const user     = await User.findById(req.user.id);
    const templeId = req.params.id;
    if (user.favorites.includes(templeId)) {
      user.favorites = user.favorites.filter((id) => id.toString() !== templeId);
      await user.save();
      return res.status(200).json({ success: true, message: "Removed from favorites", favorites: user.favorites });
    }
    user.favorites.push(templeId);
    await user.save();
    res.status(200).json({ success: true, message: "Added to favorites", favorites: user.favorites });
  } catch (error) { next(error); }
};

// ── Sync all district images from temples (one-time / on-demand) ──
exports.syncAllDistrictImages = async (req, res, next) => {
  try {
    const districts = await District.find({});
    const results   = [];
    for (const district of districts) {
      const temple = await Temple.findOne({
        district: new RegExp(`^${district.name}$`, "i"),
        isActive: true,
        images:   { $exists: true, $not: { $size: 0 } },
      }).select("images");
      if (temple?.images?.[0] && !district.image) {
        await District.findByIdAndUpdate(district._id, { image: temple.images[0] });
        results.push({ district: district.name, image: temple.images[0] });
      }
    }
    res.status(200).json({
      success: true,
      message: `Synced images for ${results.length} districts`,
      results,
    });
  } catch (error) { next(error); }
};