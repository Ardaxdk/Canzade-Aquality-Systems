const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "istila",
		usage: "istila aç/kapat",
		category: "BotOwner",
		description: "Otorolü tekrardan aktif hale getirir.",
		aliases: ["istila", "otorol"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("Open")
				.setLabel("Aç")
				.setStyle(Discord.ButtonStyle.Success),
			new Discord.ButtonBuilder()
				.setCustomId("Off")
				.setLabel("Kapat")
				.setStyle(Discord.ButtonStyle.Danger),
			new Discord.ButtonBuilder()
				.setCustomId("CANCEL")
				.setLabel("İptal")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.avatarURL({ dynamic: true }),
			})
			.setColor("Random").setDescription(`
Sunucuya fake hesap istilası olması durumunda otomatik olarak otorol işlemi kapatıldığı için tekrardan aktif hale getirilmesi için aşağıdaki butonları kullanabilirsin. Tâbii keyfine göre de açıp kapatabilirsin.
\`\`\`diff
- Otorol şuan (${server.AUTO_ROLE ? `Açık` : `Kapalı`})
\`\`\`
`);

		let msg = await message.channel.send({
			embeds: [embed],
			components: [row],
		});

		var filter = (button) => button.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 60000,
		});

		collector.on("collect", async (button) => {
			if (button.customId === "Open") {
				row.components[0].setDisabled(true);
				msg.edit({ components: [row] });

				if (server && server.AUTO_ROLE === true)
					return button.reply({
						content: `${client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.no_name,
						)} Otorol zaten açık!`,
					});
				server.AUTO_ROLE = true;
				await server.save();
				button.reply({
					content: `${client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.yes_name,
					)}  Otorol başarıyla aktif edildi! Artık yeni gelen üyelere kayıtsız rolü verilecek, tekrardan fake hesap istilası olma durumunda bu işlemin otomatik olarak kapatılacağını unutma.`,
				});
			} else if (button.customId === "Off") {
				row.components[1].setDisabled(true);
				msg.edit({ components: [row] });

				if (server && server.AUTO_ROLE === false)
					return button.reply({
						content: `${client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.no_name,
						)} Otorol zaten kapalı!`,
					});
				server.AUTO_ROLE = false;
				await server.save();
				button.reply({
					content: `${client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.yes_name,
					)} Otorol başarıyla kapatıldı! Artık yeni gelen üyelere kayıtsız rolü verilmeyecek.`,
				});
			} else if (button.customId === "CANCEL") {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				row.components[2].setDisabled(true);

				msg.edit({ components: [row] });

				button.reply({ content: "İşlem iptal edildi!" });
			}
		});

		collector.on("end", async (button) => {
			row.components[0].setDisabled(true);
			row.components[1].setDisabled(true);
			row.components[2].setDisabled(true);

			msg.edit({ components: [row] });
		});
	},
};
