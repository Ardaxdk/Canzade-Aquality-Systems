const mongoose = require("mongoose");
const StaffSchema = mongoose.Schema({
	userID: {
		type: String,
		required: "",
	},
	guildID: {
		type: String,
		required: "",
	},
	yetkililer: {
		type: Array,
		required: [],
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
		default: [],
	},
	sure: {
		type: Array,
		default: [],
	},
	minSure: {
		type: Array,
		default: [],
	},
});
module.exports = mongoose.model("StaffSchema", StaffSchema);
