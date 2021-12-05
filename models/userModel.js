const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    nickname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    favorites: { type: Array, default: [] },
    language: { type: String, required: true, default: "fr" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
