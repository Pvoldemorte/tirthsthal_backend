const express  = require("express");
const router   = express.Router();
const {
  getAllTemples, getTempleBySlug,
  createTemple, updateTemple,
  deleteTemple, searchSuggestions,
  addToFavorites, getMyFavoriteTemples,
  markTempleVisited, getMyVisitedTemples,
} = require("../controllers/templeController");
const { protect, adminOnly } = require("../middleware/auth");


router.get(  "/",                    getAllTemples);
router.get(  "/search",              searchSuggestions);
router.get(  "/my/favorites",        protect, getMyFavoriteTemples);
router.get(  "/my/visited",          protect, getMyVisitedTemples);
router.get(  "/:slug",               getTempleBySlug);
router.post( "/",     protect, adminOnly, createTemple);
router.put(  "/:id", protect, adminOnly, updateTemple);
router.delete("/:id",protect, adminOnly, deleteTemple);
router.post( "/:id/favorite", protect,  addToFavorites);
router.post( "/:id/visit",    protect,  markTempleVisited);

module.exports = router;