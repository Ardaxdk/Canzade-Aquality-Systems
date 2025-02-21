const data = require("../models/cezalı.js");
let serverSettings = require("../models/serverSettings");

module.exports = (client) => {
	setInterval(async () => {
		let muted = await data.find({
			ceza: true,
			bitis: {
				$lte: Date.now(),
			},
		});

		muted.forEach(async (memberdata) => {
			let server = await serverSettings.findOne({});
			let sunucu = client.guilds.cache.get(client.settings.GUILD_ID);
			if (!sunucu) return;
			if (!sunucu.members.cache.has(memberdata.user)) {
				data.deleteOne({ user: memberdata.user }, async (err) => {
					if (err) {
						console.log("Silinemedi.");
					}
				});
			} else {
				let member = sunucu.members.cache.get(memberdata.user);
				if (!member) return;
				member.roles.cache.has(server.BoosterRole)
					? member.roles.set([
							server.BoosterRole,
							server.UnregisteredRole[0],
					  ])
					: member.roles.set(server.UnregisteredRole);
				data.deleteOne({ user: member.id }, async (err) => {
					if (err) {
						console.log("Silinemedi.");
					}
				});
			}
		});
	}, 5000);
};
