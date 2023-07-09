const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "menu",
		usage: "menu [renk/oyun/iliski/etkinlik]",
		category: "BotOwner",
		description: "Rol seçim menüsünü atar.",
		aliases: ["menu", "menü"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;

		if (args[0] === "renk") {
			MenuCreate(
				"Renk Rolleri",
				"renk-rolleri",
				client.settings.RENK_ROLLERI,
			);
		}
		if (args[0] === "oyun") {
			MenuCreate(
				"Oyun Rolleri",
				"oyun-rolleri",
				client.settings.OYUN_ROLLERI,
			);
		}
		if (args[0] === "ilişki") {
			MenuCreate(
				"İlişki Rolleri",
				"iliski-rolleri",
				client.settings.ILISKI_ROLLERI,
			);
		}
		if (args[0] === "burç") {
			MenuCreate(
				"Burç Rolleri",
				"burc-rolleri",
				client.settings.BURC_ROLLERI,
			);
		}

		if (args[0] === "etkinlik") {
			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setCustomId("etkinlikkatilimcisi")
					.setLabel("Etkinlik Katılımcısı")
					.setStyle(Discord.ButtonStyle.Secondary),
				new Discord.ButtonBuilder()
					.setCustomId("cekiliskatilimcisi")
					.setLabel("Çekiliş Katılımcısı")
					.setStyle(Discord.ButtonStyle.Secondary),
			);

			message.channel.send({
				content: `Merhaba **${message.guild.name}** üyeleri,
Çekiliş katılımcısı alarak :nitro: , :spotify: , :netflix: , :exxen: , :blutv:  gibi çeşitli ödüllerin sahibi olabilirsiniz.
Etkinlik katılımcısı alarak çeşitli etkinliklerin yapıldığı anlarda herkesten önce haberdar olabilirsiniz ve çekilişlere önceden katılma hakkı kazanabilirsiniz.
			
Aşağıda ki butonlara basarak siz de bu ödülleri kazanmaya hemen başlayabilirsiniz!`,
				components: [row],
			});
		}

		async function MenuCreate(placeholder, customId, options) {
			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.StringSelectMenuBuilder()
					.setPlaceholder(placeholder)
					.setCustomId(customId)
					.addOptions(
						options.map((rol) => ({
							label: message.guild.roles.cache.get(rol).name,
							value: rol,
						})),
					),
			);

			await message.channel.send({ components: [row] });
		}
	},
};

client.on("interactionCreate", async (interaction) => {
	if (interaction.customId === "renk-rolleri") {
		let server = await serverSettings.findOne({
			guildID: interaction.guild.id,
		});
		if (interaction.values[0]) {
			if (
				!interaction.member.roles.cache.some((r) =>
					server.BoosterRole.includes(r.id),
				) &&
				!interaction.member.roles.cache.some((r) =>
					server.FamilyRole.includes(r.id),
				)
			)
				return interaction.reply({
					content: `Bu roller sadece <@&${server.FamilyRole}> veya <@&${server.BoosterRole}> rollerine özeldir.`,
					ephemeral: true,
				});

			if (interaction.member.roles.cache.has(interaction.values[0])) {
				await interaction.member.roles.remove(interaction.values[0]);
				interaction.reply({
					content: `<@&${interaction.values[0]}> rolü üzerinizden alındı.`,
					ephemeral: true,
				});
			} else
				await interaction.member.roles.set(
					interaction.member.roles.cache.filter(
						(role) =>
							!client.settings.RENK_ROLLERI.includes(role.id),
					),
				);
			await interaction.member.roles.add(interaction.values[0]);
			interaction.reply({
				content: `<@&${interaction.values[0]}> rolü üzerinize verildi.`,
				ephemeral: true,
			});
		}
	} else if (interaction.customId === "burc-rolleri") {
		if (interaction.values[0]) {
			if (interaction.member.roles.cache.has(interaction.values[0])) {
				await interaction.member.roles.remove(interaction.values[0]);
				interaction.reply({
					content: `<@&${interaction.values[0]}> rolü üzerinizden alındı.`,
					ephemeral: true,
				});
			} else
				await interaction.member.roles.set(
					interaction.member.roles.cache.filter(
						(role) =>
							!client.settings.BURC_ROLLERI.includes(role.id),
					),
				);
			await interaction.member.roles.add(interaction.values[0]);
			interaction.reply({
				content: `<@&${interaction.values[0]}> rolü üzerinize verildi.`,
				ephemeral: true,
			});
		}
	} else if (interaction.customId === "iliski-rolleri") {
		if (interaction.values[0]) {
			if (interaction.member.roles.cache.has(interaction.values[0])) {
				await interaction.member.roles.remove(interaction.values[0]);
				interaction.reply({
					content: `<@&${interaction.values[0]}> rolü üzerinizden alındı.`,
					ephemeral: true,
				});
			} else
				await interaction.member.roles.set(
					interaction.member.roles.cache.filter(
						(role) =>
							!client.settings.ILISKI_ROLLERI.includes(role.id),
					),
				);
			await interaction.member.roles.add(interaction.values[0]);
			interaction.reply({
				content: `<@&${interaction.values[0]}> rolü üzerinize verildi.`,
				ephemeral: true,
			});
		}
	} else if (interaction.customId === "oyun-rolleri") {
		if (interaction.values[0]) {
			if (interaction.member.roles.cache.has(interaction.values[0])) {
				await interaction.member.roles.remove(interaction.values[0]);
				interaction.reply({
					content: `<@&${interaction.values[0]}> rolü üzerinizden alındı.`,
					ephemeral: true,
				});
			} else await interaction.member.roles.add(interaction.values[0]);
			interaction.reply({
				content: `<@&${interaction.values[0]}> rolü üzerinize verildi.`,
				ephemeral: true,
			});
		}
	} else if (interaction.customId === "etkinlikkatilimcisi") {
		if (
			interaction.member.roles.cache.has(
				client.settings.ETKINLIK_KATILIMCISI,
			)
		) {
			await interaction.member.roles.remove(
				client.settings.ETKINLIK_KATILIMCISI,
			);
			interaction.reply({
				content: `<@&${client.settings.ETKINLIK_KATILIMCISI}> rolü üzerinizden alındı.`,
				ephemeral: true,
			});
		} else
			await interaction.member.roles.add(
				client.settings.ETKINLIK_KATILIMCISI,
			);
		interaction.reply({
			content: `<@&${client.settings.ETKINLIK_KATILIMCISI}> rolü üzerinize verildi.`,
			ephemeral: true,
		});
	} else if (interaction.customId === "cekiliskatilimcisi") {
		if (
			interaction.member.roles.cache.has(
				client.settings.CEKILIS_KATILIMCISI,
			)
		) {
			await interaction.member.roles.remove(
				client.settings.CEKILIS_KATILIMCISI,
			);
			interaction.reply({
				content: `<@&${client.settings.CEKILIS_KATILIMCISI}> rolü üzerinizden alındı.`,
				ephemeral: true,
			});
		} else
			await interaction.member.roles.add(
				client.settings.CEKILIS_KATILIMCISI,
			);
		interaction.reply({
			content: `<@&${client.settings.CEKILIS_KATILIMCISI}> rolü üzerinize verildi.`,
			ephemeral: true,
		});
	}
});
