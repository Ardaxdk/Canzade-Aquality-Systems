const mongoose = require("mongoose");

const Task = new mongoose.Schema({
	userID: {
		type: String,
		default: "",
	},
	situation: {
		type: Boolean,
		default: true,
	},
	completed: {
		type: Boolean,
		default: false,
	},
	level: {
		type: Number,
		default: 0,
	},
	target: {
		type: Number,
		default: 0,
	},
	point: {
		type: Number,
		default: 100,
	},
	type: {
		type: String,
		default: "",
	},
	tasknumber: {
		type: Number,
	},
	description: {
		type: String,
		default: "",
	},
	date: {
		type: Date,
		default: null,
	},
	end: {
		type: Date,
		default: null,
	},
});

module.exports = mongoose.model("Task", Task);
