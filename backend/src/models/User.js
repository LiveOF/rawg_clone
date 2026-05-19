const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    gameId: { type: Number, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    shortDescription: { type: String, required: true },
    genre: { type: String },
    platform: { type: String },
    addedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    favorites: { type: [FavoriteSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
