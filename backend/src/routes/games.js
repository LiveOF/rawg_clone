const express = require("express");
const { getGames, getGameById } = require("../services/freetogame");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { platform, category, sortBy, search, page, pageSize } = req.query;
    const data = await getGames({ platform, category, sortBy, search, page, pageSize });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const gameId = Number(req.params.id);
    if (!Number.isFinite(gameId)) {
      return res.status(400).json({ message: "Invalid game id" });
    }
    const game = await getGameById(gameId);
    res.json(game);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
