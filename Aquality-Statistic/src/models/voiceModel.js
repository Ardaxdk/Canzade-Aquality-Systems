const mongoose = require("mongoose");
const VoiceSchema = mongoose.Schema({
	userID: {
		type: String,
	},
	guildID: {
		type: String,
	},
	messages: {
		type: Number,
		default: 0,
	},
	voice: {
		type: Number,
		default: 0,
	},
	streaming: {
		type: Number,
		default: 0,
	},
	cam: {
		type: Number,
		default: 0,
	},
});
module.exports = mongoose.model("VoiceSchema", VoiceSchema);
