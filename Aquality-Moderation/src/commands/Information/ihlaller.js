const data = require("../../models/cezalar.js");
let serverSettings = require("../../models/serverSettings");
const Discord = require("discord.js");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const { table } = require("table");
module.exports = {
	conf: {
		name: "cezalar",
		usage: "cezalar [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişinin tüm cezalarını görürsünüz.",
		aliases: ["cezalar", "ihlaller"],
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
				"Ceza bilgilerine bakmak istediğin kullanıcyı belirtmelisin",
				message.author,
				message.channel,
			);
		await data
			.find({ user: user.id })
			.sort({ ihlal: "descending" })
			.exec(async (err, res) => {
				let datax = [["ID", "Tarih", "Ceza", "Sebep"]];

				let dataxe = [
					["ID", "Ceza", "Tarih", "Bitiş", "Yetkili", "Sebep"],
				];

				let config = {
					border: {
						topBody: ``,
						topJoin: ``,
						topLeft: ``,
						topRight: ``,

						bottomBody: ``,
						bottomJoin: ``,
						bottomLeft: ``,
						bottomRight: ``,

						bodyLeft: `│`,
						bodyRight: `│`,
						bodyJoin: `│`,

						joinBody: ``,
						joinLeft: ``,
						joinRight: ``,
						joinJoin: ``,
					},
				};
				res.map((x) => {
					datax.push([x.ihlal, x.tarih, x.ceza, x.sebep]);
				});
				let cezaSayi = datax.length - 1;
				if (cezaSayi == 0)
					return message.reply({
						content: `${user} kullanıcısının ceza bilgisi bulunmuyor.`,
					});

				res.map((x) => {
					dataxe.push([
						x.ihlal,
						x.ceza,
						x.tarih,
						x.bitiş,
						client.users.cache.get(x.yetkili).username,
						x.sebep,
					]);
				});

				let out = table(dataxe, config);
				let outi = table(datax.slice(0, 15), config);

				const row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
						.setCustomId("CezaDosya")
						.setLabel("Ceza Bilgi Dosyası")
						.setEmoji("🚫")
						.setStyle(Discord.ButtonStyle.Primary),
					new Discord.ButtonBuilder()
						.setCustomId("CezaSayı")
						.setLabel("Ceza Sayıları")
						.setEmoji("❔")
						.setStyle(Discord.ButtonStyle.Primary),
					new Discord.ButtonBuilder()
						.setCustomId("CANCEL")
						.setLabel("İptal")
						.setStyle(Discord.ButtonStyle.Danger),
				);
				let msg = await message.reply({
					components: [row],
					content:
						"<@" +
						user.id +
						"> kişisinin ceza bilgileri aşağıda belirtilmiştir. Tekli bir cezaya bakmak için `!ceza ID` komutunu uygulayınız.  " +
						"```fix\n" +
						outi +
						"\n```",
				});

				var filter = (button) => button.user.id === message.author.id;
				const collector = msg.createMessageComponentCollector({
					filter,
					time: 30000,
				});

				collector.on("collect", async (button) => {
					if (button.customId === "CezaDosya") {
						row.components[0].setDisabled(true);
						msg.edit({ components: [row] });
						button.reply({
							content: `${user} kullanıcısının toplam ${
								datax.length - 1
							} cezası aşağıdaki belgede yazmaktadır.`,
							ephemeral: true,
							files: [
								{
									attachment: Buffer.from(out),
									name: `${user.user.username}_cezalar.txt`,
								},
							],
						});
					} else if (button.customId === "CezaSayı") {
						row.components[1].setDisabled(true);
						msg.edit({ components: [row] });
						let filterArr = res.map((x) => x.ceza);
						let chatMute =
							filterArr.filter((x) => x == "Chat Mute").length ||
							0;
						let voiceMute =
							filterArr.filter((x) => x == "Voice Mute").length ||
							0;
						let jail =
							filterArr.filter((x) => x == "Cezalı").length || 0;
						let ban =
							filterArr.filter((x) => x == "Yasaklı").length || 0;
						let puan = await client.punishPoint(user.id);
						button.reply({
							content:
								"```" +
								user.user.username +
								" kullanıcısının ceza bilgileri aşağıda belirtilmiştir:\n\nChat Mute: " +
								chatMute +
								" kez.\nSes Mute: " +
								voiceMute +
								" kez.\nCezalı Bilgisi: " +
								jail +
								" kez.\nBan Bilgisi: " +
								ban +
								" kez.\n\nKullanıcı toplamda " +
								cezaSayi +
								" kez kural ihlali yapmış, kullanıcının ceza puanı " +
								puan +
								".```",
							ephemeral: true,
						});
					} else if (button.customId === "CANCEL") {
						row.components[0].setDisabled(true);
						row.components[1].setDisabled(true);
						row.components[2].setDisabled(true);
						msg.edit({ components: [row] });

						button.reply({
							content: "İşlem iptal edildi!",
							ephemeral: true,
						});
					}
				});
				collector.on("end", async (button, reason) => {
					row.components[0].setDisabled(true);
					row.components[1].setDisabled(true);
					row.components[2].setDisabled(true);
					msg.edit({ components: [row] });
				});
			});
	},
};
