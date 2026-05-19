const express = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const { getGameById } = require("../services/freetogame");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  res.json({ favorites: req.user.favorites });
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const gameId = Number(req.body.gameId);
    if (!Number.isFinite(gameId)) {
      return res.status(400).json({ message: "Invalid game id" });
    }

    const user = await User.findById(req.user._id);
    const alreadyExists = user.favorites.some((fav) => fav.gameId === gameId);
    if (alreadyExists) {
      return res.status(409).json({ message: "Already in favorites" });
    }

    const game = await getGameById(gameId);
    user.favorites.push({
      gameId,
      title: game.title,
      thumbnail: game.thumbnail,
      shortDescription: game.short_description,
      genre: game.genre,
      platform: game.platform
    });

    await user.save();
    return res.status(201).json({ favorites: user.favorites });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:gameId", authMiddleware, async (req, res, next) => {
  try {
    const gameId = Number(req.params.gameId);
    if (!Number.isFinite(gameId)) {
      return res.status(400).json({ message: "Invalid game id" });
    }

    const user = await User.findById(req.user._id);
    const originalCount = user.favorites.length;
    user.favorites = user.favorites.filter((fav) => fav.gameId !== gameId);
    if (user.favorites.length === originalCount) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    await user.save();
    return res.json({ favorites: user.favorites });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
