const data = require("../../models/cezalar.js");
const uyarılar = require("../../models/uyar.js");
let serverSettings = require("../../models/serverSettings");
const ms = require("ms");
const moment = require("moment");
const sunucu = require("../../models/sunucu-bilgi");
require("moment-duration-format");
moment.locale("tr");
const { table } = require("table");
const uyar = require("../../models/uyar.js");
const Discord = require("discord.js");
module.exports = {
	conf: {
		name: "uyarılar",
		usage: "uyarılar [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişinin uyarılarını görürsünüz.",
		aliases: ["uyarılar"],
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
		let user =
			message.mentions.members.first() ||
			(await client.üye(args[0], message.guild));
		if (!user)
			return client.send(
				"Uyarılarına bakmak istediğin kullanıcyı belirtmelisin",
				message.author,
				message.channel,
			);
		uyarılar.findOne({ user: user.id }, async (err, res) => {
			if (!res)
				return client.send(
					"Belirttiğin kullanıcının uyarısı bulunmuyor.",
					message.author,
					message.channel,
				);
			let num = 1;
			let uyarılarMap = res.uyarılar
				.map(
					(x) =>
						`- ${num++}. numaralı uyarı ${
							client.users.cache.get(x.mod).username
						} tarafından ${moment(x.tarih).format(
							"LLL",
						)} tarihinde "${x.sebep}" sebebiyle verilmiş.\n`,
				)
				.join("\n");
			const embed = new Discord.EmbedBuilder()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL({ dynamic: true }),
				})
				.setColor("Random")
				.setDescription(
					`${user} kullanıcısının tüm uyarıları aşağıda belirtilmiştir:\n\n\`\`\`${uyarılarMap}\`\`\``,
				);
			message.channel.send({ embeds: [embed] });
		});
	},
};
