const data = require("../models/alarm.js");
let serverSettings = require("../models/serverSettings");

module.exports = (client) => {
	setInterval(async () => {
		let muted = await data.find({
			alarm: true,
			endDate: {
				$lte: Date.now(),
			},
		});

		muted.forEach(async (memberdata) => {
			let server = await serverSettings.findOne({});
			let sunucu = client.guilds.cache.get(client.settings.GUILD_ID);
			if (!sunucu) return;
			let member =
				sunucu.members.cache.get(memberdata.user) ||
				(await sunucu.members.fetch(memberdata.user).catch((err) => {
					data.deleteOne({ user: memberdata.user }, async (err) => {
						if (err) {
							console.log("Silinemedi");
						}
					});
					console.log(`[ALARM] ${memberdata.user} bulunamadı`);
					console.log(err);
				}));
			if (!member) return;
			let kanal = sunucu.channels.cache.get(memberdata.channel);
			kanal.send({
				content:
					":alarm_clock: | <@!" +
					member +
					"> **" +
					memberdata.sebep +
					"** sebebi ile alarm kurmamı istemiştin.",
			});
			let mem = sunucu.members.cache.get(memberdata.user);
			mem.send({
				content:
					":alarm_clock: | <@!" +
					member +
					"> **" +
					memberdata.sebep +
					"** sebebi ile alarm kurmamı istemiştin.",
			}).catch();
			data.deleteOne({ user: memberdata.user }, async (err) => {
				if (err) {
					console.log("Silinemedi");
				}
			});
		});
	}, 5000);
};
