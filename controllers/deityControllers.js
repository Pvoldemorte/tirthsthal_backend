const Deity = require("../models/Deity");

exports.getAllDeities = async (req, res, next) => {
  try {
    const deities = await Deity.find({ isActive: true }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: deities.length, deities });
  } catch (error) { next(error); }
};

exports.createDeity = async (req, res, next) => {
  try {
    const deity = await Deity.create(req.body);
    res.status(201).json({ success: true, deity });
  } catch (error) { next(error); }
};

exports.updateDeity = async (req, res, next) => {
  try {
    const deity = await Deity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deity) return res.status(404).json({ success: false, message: "Deity not found" });
    res.status(200).json({ success: true, deity });
  } catch (error) { next(error); }
};

exports.deleteDeity = async (req, res, next) => {
  try {
    await Deity.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deity deleted" });
  } catch (error) { next(error); }
};