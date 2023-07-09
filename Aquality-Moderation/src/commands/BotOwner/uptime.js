const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
let serverSettings = require("../../models/serverSettings");
moment.locale("tr");
module.exports = {
	conf: {
		name: "uptime",
		usage: "uptime",
		category: "BotOwner",
		description: "Botun ne kadar süre önce çalışmaya başladığını gösterir.",
		aliases: ["uptime"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;
		let up = moment
			.duration(client.uptime)
			.format(" D [gün], H [saat], m [dakika], s [saniye]");
		message.channel.send({
			content: "Bot " + up + " önce çalışmaya başladı.",
		});
	},
};
