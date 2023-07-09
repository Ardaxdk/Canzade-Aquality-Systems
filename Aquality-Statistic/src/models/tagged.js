const mongoose = require("mongoose");
const TaggedSchema = mongoose.Schema({
	userID: {
		type: String,
		required: true,
	},
	guildID: {
		type: String,
		required: true,
	},
	taglılar: {
		type: Array,
		required: true,
	},
	total: {
		type: Number,
		default: 0,
	},
	leave: {
		type: Number,
		default: 0,
	},
	tarih: {
		type: Array,
		default: true,
	},
});
module.exports = mongoose.model("TaggedSchema", TaggedSchema);
