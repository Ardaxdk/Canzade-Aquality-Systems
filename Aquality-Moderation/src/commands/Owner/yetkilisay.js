let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "yetkilisay",
		usage: "ysay",
		category: "Owner",
		description: "Sunucudaki yetkilileri sayar.",
		aliases: ["ysay", "yetkili-say"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!server.BotOwner.includes(message.author.id) &&
			!server.GuildOwner.includes(message.author.id)
		)
			return;
		let roles = message.guild.roles.cache.get(`${server.BotCommandRole}`);
		let üyeler = [
			...message.guild.members.cache
				.filter(
					(uye) =>
						!uye.user.bot &&
						uye.roles.highest.position >= roles.position &&
						uye.presence &&
						uye.presence.status !== "offline" &&
						!uye.voice.channel,
				)
				.values(),
		];

		if (üyeler.length == 0)
			return message.channel.send({
				content: "çevrimiçi yetkili olup seste olmayan yetkili yok",
			});

		message.channel.send({
			content: `Online olup seste olmayan <@&${
				roles.id
			}> rolündeki ve üzerinde ki yetkili sayısı: ${üyeler.length ?? 0} `,
		});
		message.channel.send({
			content: `` + üyeler.map((x) => "<@" + x.id + ">").join(",") + ``,
		});
	},
};
