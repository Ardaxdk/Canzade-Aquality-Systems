const mongoose = require("mongoose");
const ChannelSchema = mongoose.Schema({
	userID: {
		type: String,
	},
	guildID: {
		type: String,
	},
	channelID: {
		type: String,
	},
	type: {
		type: String,
	},
	data: {
		type: Number,
		default: 0,
	},
});
module.exports = mongoose.model("ChannelSchema", ChannelSchema);
