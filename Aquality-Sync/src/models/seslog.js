const mongoose = require("mongoose");

module.exports = mongoose.model(
	"zade_kanallog",
	new mongoose.Schema({
		user: String,
		kanallar: Array,
	}),
);
