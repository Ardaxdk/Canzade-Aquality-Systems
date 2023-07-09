const isimler = require("../models/isimler.js");
let serverSettings = require("../models/serverSettings");

module.exports = async (member) => {
	let server = await serverSettings.findOne({});
	if (server.UnregisteredRole.some((x) => member.roles.cache.has(x))) return;
	isimler.findOne({ user: member.id }, async (err, res) => {
		if (!res) {
			let arr = [];
			arr.push({
				isim: member.displayName,
				state: "Sunucudan Ayrılma",
				yetkili: "Yok",
			});
			let newData = new isimler({
				user: member.id,
				isimler: arr,
			});
			await newData.save().catch((e) => console.log(e));
		} else {
			res.isimler.push({
				isim: member.displayName,
				state: "Sunucudan Ayrılma",
				yetkili: "Yok",
			});
			await res.save().catch((e) => console.log(e));
		}
	});
};

module.exports.conf = {
	name: "guildMemberRemove",
};
