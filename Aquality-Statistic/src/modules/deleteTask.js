const tasks = require("../models/task");
const { scheduleJob } = require("node-schedule");
module.exports = async (client) => {
	scheduleJob("* */1 * * *", async () => {
		let task = await tasks.find({
			situation: true,
			end: {
				$lte: Date.now(),
			},
		});

		task.filter(async (memberdata) => {
			let sunucu = client.guilds.cache.get(client.settings.GUILD_ID);
			if (!sunucu) return;
			let member = sunucu.members.cache.get(memberdata.userID);
			if (!member) return;
			await tasks.deleteOne({ userID: member.id }, (err) => {
				if (err) {
					console.log("Silinemedi.");
				}
			});
		});
	});
};
