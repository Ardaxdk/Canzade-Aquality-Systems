const data = require("../../models/cezalar.js");
const ms = require("ms");
const moment = require("moment");
let serverSettings = require("../../models/serverSettings");
require("moment-duration-format");
moment.locale("tr");
const { table } = require("table");
const Discord = require("discord.js");
module.exports = {
	conf: {
		name: "rapor",
		usage: "rapor [#cezanumarası]",
		category: "Authorized",
		description: "İşlenmiş cezaya rapor eklersiniz.",
		aliases: ["rapor"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.JailAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		if (!args[0])
			return client.send(
				"Bir ceza numarası belirt ve tekrardan dene",
				message.author,
				message.channel,
			);

		if (!args[1])
			return client.send(
				"Eklemek istediğin raporu yazmalısın.",
				message.author,
				message.channel,
			);
		await data.findOne({ ihlal: args[0] }, async (err, res) => {
			if (!res)
				return client.send(
					"Belirttiğin numaralı ceza bilgisi bulunamadı.",
					message.author,
					message.channel,
				);

			res.rapor = args.slice(1).join(" ");
			await res.save();

			message.reply({
				content: `${args[0]} id'li cezaya **${args
					.slice(1)
					.join(" ")}** raporu eklendi. Kontrol etmek için !ceza ${
					args[0]
				}`,
			});
		});
	},
};
