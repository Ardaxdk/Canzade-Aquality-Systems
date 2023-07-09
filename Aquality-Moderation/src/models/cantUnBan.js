const mongoose = require("mongoose");

module.exports = mongoose.model(
	"zade_cantunban",
	new mongoose.Schema({
		userID: { type: String },
		mod: { type: String },
		sebep: { type: String },
	}),
);
