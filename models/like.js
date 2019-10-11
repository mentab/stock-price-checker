const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const Like = mongoose.Schema;

const LikeSchema = new Like({
  stock: { type: String, required: true, max: 15 },
  ips: [{ type: String }]
});

module.exports = mongoose.model("Like", LikeSchema);
