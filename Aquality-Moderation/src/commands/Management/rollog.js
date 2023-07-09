const Discord = require("discord.js");
const roller = require("../../models/rollog.js");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = {
	conf: {
		name: "rollog",
		usage: "rollog [@user]",
		category: "Management",
		description: "Belirttiğiniz üyenin üye rollog bilgilerini gösterir.",
		aliases: ["rol-log", "rollogs", "rol-logs"],
	},

	async run(client, message, args) {
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
		const Veri = await roller.findOne({ user: Member.id });
		if (!Veri)
			return client.send(
				"<@" +
					Member.id +
					"> kişisinin rol bilgisi veritabanında bulunmadı.",
				message.author,
				message.channel,
			);
		let page = 1;
		let rol = Veri.roller.sort((a, b) => b.tarih - a.tarih);
		// let liste = rol.map(x => `${x.state == "Ekleme" ? client.ok : client.no} Rol: <@&${x.rol}> Yetkili: <@${x.mod}>\nTarih: ${moment(x.tarih).format("LLL")}`)
		let liste = rol.map(
			(x) =>
				`**Tarih: ${moment(x.tarih).format("LLL")}**
				${
					x.state == "Ekleme"
						? client.emojis.cache.find(
								(x) =>
									x.name === client.settings.emojis.yes_name,
						  )
						: client.emojis.cache.find(
								(x) =>
									x.name === client.settings.emojis.no_name,
						  )
				} Rol: <@&${x.rol}> Yetkili: <@${x.mod}>`,
		);
		const cancık = new Discord.EmbedBuilder()
			.setTitle(
				`Gösterilen rol bilgisi: 1/${
					liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10)
						.length
				} - bulunan : ${Veri.roller.length} adet`,
			)
			.setDescription(
				`
${Member} Kişisinin rollog bilgileri listelendi.

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
					let rollogVeri = liste
						.slice(page == 1 ? 0 : page * 10 - 10, page * 10)
						.join("\n");
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setColor("Random")
								.setTitle(
									`Gösterilen rol bilgisi: 1/${
										liste.slice(
											page == 1 ? 0 : page * 10 - 10,
											page * 10,
										).length
									} - bulunan : ${Veri.roller.length} adet`,
								)
								.setDescription(
									`
${Member} Kişisinin rollog bilgileri listelendi.

${rollogVeri}`,
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
					let rollogVeri = liste
						.slice(page == 1 ? 0 : page * 10 - 10, page * 10)
						.join("\n");
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setColor("Random")
								.setTitle(
									`Gösterilen rol bilgisi: 1/${
										liste.slice(
											page == 1 ? 0 : page * 10 - 10,
											page * 10,
										).length
									} - bulunan : ${Veri.roller.length} adet`,
								)
								.setDescription(
									`
${Member} Kişisinin rollog bilgileri listelendi.

${rollogVeri}`,
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
