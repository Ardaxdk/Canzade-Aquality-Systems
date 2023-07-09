let Yetkili = require("../models/staff");
let Taglı = require("../models/tagged");
let serverSettings = require("../models/serverSettings");

module.exports = async (oldUser, newUser) => {
	const server = await serverSettings.findOne({});

	let member = newUser.client.guilds.cache
		.get(client.settings.GUILD_ID)
		.members.cache.get(newUser.id);

	if (
		oldUser.username.includes(server.Tag) &&
		!newUser.username.includes(server.Tag)
	) {
		await Yetkili.findOneAndUpdate(
			{ yetkililer: member.user.id },
			{ $inc: { leave: 1 } },
			{ upsert: true },
		);
		await Taglı.findOneAndUpdate(
			{ taglılar: member.user.id },
			{ $inc: { leave: 1 } },
			{ upsert: true },
		);
	}
};
module.exports.conf = {
	name: "userUpdate",
};
