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
		name: "ceza",
		usage: "ceza [#cezanumarası]",
		category: "Authorized",
		description: "İşlenmiş cezanın detaylarını görürsünüz.",
		aliases: ["ceza", "ihlal"],
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

		if (args && isNaN(args))
			return client.send(
				`Sayı yazmalısın.`,
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
			let user = client.users.cache.get(res.user);
			const embed = new Discord.EmbedBuilder()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL({ dynamic: true }),
				})
				.setColor("Random")
				.setThumbnail(
					`${
						user
							? user.displayAvatarURL({ dynamic: true })
							: message.guild.iconURL({ dynamic: true })
					}`,
				)
				.setDescription(
					` 
<@${res.user}> (\`${res.user}\`) kişisine uygulanan ${res.ihlal} numaralı ceza bilgisi;
`,
				)
				.addFields([{ name: "Ceza Türü", value: `${res.ceza}` }])
				.addFields([
					{
						name: "Ceza Atan Yetkili:",
						value: `${client.users.cache.get(res.yetkili)} (\`${
							client.users.cache.get(res.yetkili).id
						}\`) `,
					},
				])
				.addFields([{ name: "Ceza Sebebi:", value: `${res.sebep}` }])
				.addFields([{ name: "Ceza Başlangıç:", value: `${res.tarih}` }])
				.addFields([{ name: "Ceza Bitiş:", value: `${res.bitiş}` }])
				.addFields([
					{
						name: "Ceza Raporu:",
						value: `${res.rapor ?? "Eklenmedi"}.`,
					},
				]);

			message.channel.send({ embeds: [embed] });
		});
	},
};
