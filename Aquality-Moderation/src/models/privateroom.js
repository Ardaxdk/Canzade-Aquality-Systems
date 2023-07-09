const mongoose = require("mongoose");
const PrivateChannel = mongoose.Schema({
	channelOwner: {
		type: String,
		default: "",
	},
	textChannelID: {
		type: String,
		default: "",
	},
	voiceChannelID: {
		type: String,
		default: "",
	},
	channelName: {
		type: String,
		default: "",
	},
	channelLimit: {
		type: Number,
		default: 0,
	},
	createDate: {
		type: Number,
		default: 0,
	},
	channelPrivate: {
		type: String,
		default: "",
	},
	channelUserPermission: {
		type: Array,
		default: [],
	},
});
module.exports = mongoose.model("PrivateChannel", PrivateChannel);
