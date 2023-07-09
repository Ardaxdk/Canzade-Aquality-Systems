const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
let serverSettings = require("../../models/serverSettings");
moment.locale("tr");
const db = require("../../models/cantUnBan.js");

module.exports = {
	conf: {
		name: "ban-list",
		usage: "banlist",
		category: "Authorized",
		description:
			"Sunucudan yasaklanmış kişilerin tam listesini görürsünüz.",
		aliases: ["banlist"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.BanAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		const fetchBans = message.guild.bans.fetch();
		fetchBans.then((banned) => {
			let list = banned
				.map((user) => `${user.user.id} | ${user.user.username}`)
				.join("\n");
			message.channel.send({
				content: `\`\`\`js
${list}\n\nSunucumuzda toplam ${banned.size} yasaklı kullanıcı bulunmakta. Kişilerin ban nedenlerini öğrenmek icin !banbilgi ID komutunu uygulamalısın.\`\`\``,
			});
		});
	},
};
