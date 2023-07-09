const mongoose = require("mongoose");

const zade_toplantı = new mongoose.Schema({
	yetkili: String,
	toplantiId: Number,
	uyeler: Array,
	active: Boolean,
	type: String,
	tarih: Number,
	bitiş: Number,
});

module.exports = mongoose.model("zade_toplantı", zade_toplantı);
