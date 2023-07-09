const Discord = require("discord.js");
const kanallar = require("../../models/seslog.js");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = {
	conf: {
		name: "rmlog",
		usage: "rmlog [@user]",
		category: "Management",
		description: "Belirttiğiniz üyenin üye kanallog bilgilerini gösterir.",
		aliases: ["kanal-log", "kanallog", "kanal-logs"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});

		if (
			!message.member.roles.cache.some((r) =>
				server.RoleManageAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		const Member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;
		const Veri = await kanallar.findOne({ user: Member.id });
		if (!Veri)
			return client.send(
				"<@" +
					Member.id +
					"> kişisinin kanal bilgisi veritabanında bulunmadı.",
				message.author,
				message.channel,
			);
		let page = 1;
		let kanal = Veri.kanallar.sort((a, b) => b.tarih - a.tarih);
		let liste = kanal.map(
			(x) =>
				`[\`${moment(x.tarih).format("DD.MM.YY HH:mm")}\`] ${
					x.state == "Değiştirme"
						? `🔴 **${
								message.guild.channels.cache.get(x.kanal)
									? message.guild.channels.cache.get(x.kanal)
											.name
									: "Kanal Silinmiş"
						  }** ••> **${
								message.guild.channels.cache.get(x.yenikanal)
									? message.guild.channels.cache.get(
											x.yenikanal,
									  ).name
									: "Kanal Silinmiş"
						  }**`
						: ` 🟠 **${
								message.guild.channels.cache.get(x.kanal)
									? message.guild.channels.cache.get(x.kanal)
											.name
									: "Kanal Silinmiş"
						  }**`
				}`,
		);
		const cancık = new Discord.EmbedBuilder()
			.setTitle(
				`Gösterilen kanal bilgisi: 1/${
					liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10)
						.length
				} - bulunan : ${Veri.kanallar.length} adet`,
			)
			.setDescription(
				`
${Member} Kişisinin kanallog bilgileri listelendi.

${liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10).join("\n")}`,
			)

			.setColor("Random");

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("ÖncekiSayfa")
				.setLabel("Önceki Sayfa")
				.setEmoji("⬅️")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("CANCEL")
				.setLabel("İptal")
				.setStyle(Discord.ButtonStyle.Danger),
			new Discord.ButtonBuilder()
				.setCustomId("SonrakiSayfa")
				.setLabel("Sonraki Sayfa")
				.setEmoji("➡️")
				.setStyle(Discord.ButtonStyle.Primary),
		);
		var msg = await message.reply({ embeds: [cancık] });
		var filter = (button) => button.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 30000,
		});

		if (liste.length > 10) {
			msg.edit({ components: [row] });
			collector.on("collect", async (button) => {
				if (button.customId === "SonrakiSayfa") {
					if (
						liste.slice((page + 1) * 10 - 10, (page + 1) * 10)
							.length <= 0
					)
						return;
					msg.edit({ components: [row] });

					page += 1;
					let kanalLogVeri = liste
						.slice(page == 1 ? 0 : page * 10 - 10, page * 10)
						.join("\n");
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setColor("Random")
								.setTitle(
									`Gösterilen kanal bilgisi: 1/${
										liste.slice(
											page == 1 ? 0 : page * 10 - 10,
											page * 10,
										).length
									} - bulunan : ${Veri.kanallar.length} adet`,
								)
								.setDescription(
									`
${Member} Kişisinin kanallog bilgileri listelendi.

${kanalLogVeri}`,
								),
						],
					});

					button.deferUpdate();
				} else if (button.customId === "ÖncekiSayfa") {
					if (
						liste.slice((page - 1) * 10 - 10, (page - 1) * 10)
							.length <= 0
					)
						return;
					page -= 1;
					let kanalLogVeri = liste
						.slice(page == 1 ? 0 : page * 10 - 10, page * 10)
						.join("\n");
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setColor("Random")
								.setTitle(
									`Gösterilen kanal bilgisi: 1/${
										liste.slice(
											page == 1 ? 0 : page * 10 - 10,
											page * 10,
										).length
									} - bulunan : ${Veri.kanallar.length} adet`,
								)
								.setDescription(
									`
${Member} Kişisinin kanallog bilgileri listelendi.

${kanalLogVeri}`,
								),
						],
					});

					button.deferUpdate();
				} else if (button.customId === "CANCEL") {
					row.components[0].setDisabled(true);
					row.components[1].setDisabled(true);
					row.components[2].setDisabled(true);
					msg.edit({ components: [row] });
					button.reply({ content: "İşlem iptal edildi." });
				}
			});

			collector.on("end", async (button, reason) => {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				row.components[2].setDisabled(true);
				msg.edit({ components: [row] });
			});
		}
	},
};
