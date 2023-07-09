const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
const notlar = require("../../models/notlar.js");
const moment = require("moment");
module.exports = {
	conf: {
		name: "Notlar",
		usage: "notlar [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişite bırakılmış notları görürsünüz.",
		aliases: ["notlar"],
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
				"Ceza notlarına bakmak istediğin kullanıcıyı belirtmen gerekir.",
				message.author,
				message.channel,
			);
		await notlar.findOne({ user: user.id }, async (err, res) => {
			if (!res)
				return client.send(
					"Belirttiğin üyenin veritabanında ceza notu bulunmamaktadır.",
					message.author,
					message.channel,
				);
			const notes = new Discord.EmbedBuilder()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL({ dynamic: true }),
				})
				.setDescription(
					`🚫 <@${
						user.id
					}> kişisinin ceza notları aşağıda belirtilmiştir.\n\n${res.notlar
						.map(
							(x) =>
								`- Not Bırakan <@${x.yetkili}>(\`${
									x.yetkili
								}\`)\n- Not: \`${x.not} - ${moment(
									x.tarih,
								).format("LLL")}\``,
						)
						.join("\n\n")}`,
					{ split: true },
				)
				.setColor("Random");
			let notlarıms = res.notlar.map(
				(x) =>
					`• Not Bırakan Yetkili: <@${x.yetkili}>(\`${
						x.yetkili
					}\`)\n• Not: \`${x.not} - ${moment(x.tarih).format(
						"LLL",
					)}\``,
			);
			const MAX_CHARS = 3 + 2 + notlar.length + 3;
			if (MAX_CHARS > 2000) {
				const cann = new Discord.EmbedBuilder()
					.setAuthor({
						name: message.author.username,
						iconURL: message.author.displayAvatarURL({
							dynamic: true,
						}),
					})
					.setDescription(
						`🚫 <@${
							user.id
						}> kişisinin ceza notları fazla olduğundan dolayı son 10 not aşağıda belirtilmiştir.\n\n${notlarıms
							.reverse()
							.join("\n\n")}`,
					)
					.setColor("Random");
				message.channel.send({ embeds: [cann] });
			} else {
				message.channel.send({ embeds: [notes] });
			}
		});
	},
};
