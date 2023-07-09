const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "kanal",
		usage: "kanal",
		category: "Management",
		description:
			"Kanal, register sistemi ve kanallarını kilitleyip açmaya yarar.",
		aliases: ["kanal", "kilit"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});

		if (
			!server.GuildOwner.includes(message.author.id) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.Administrator,
			)
		)
			return;

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.avatarURL({ dynamic: true }),
			})
			.setColor("Random").setDescription(`
Bu kanal şuan: ${
			message.channel
				.permissionsFor(message.guild.id)
				.has(Discord.PermissionsBitField.Flags.SendMessages)
				? "Açık"
				: "Kapalı"
		}
\`\`\`Komutu kullandığınız kanalın kilitlenmesini/açılmasını istiyorsanız: Kanal Kilit butonunu kullanın.\`\`\` 
Register sistemi şuan: ${server.RegisterSystem ? "Açık" : "Kapalı"}
\`\`\`Register voice kanallarının ve register sisteminin kilitlenmesini/açılmasını istiyorsanız: Register Kilit butonunu kullanın.\`\`\`

`);

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("ChannelLocking")
				.setLabel("Kanal Kilit")
				.setEmoji("🔒")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("RegisterLocking")
				.setLabel("Register Kilit")
				.setEmoji("🔒")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("CANCEL")
				.setLabel("İptal")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		var msg = await message.channel.send({
			embeds: [embed],
			components: [row],
		});
		var filter = (button) => button.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 30000,
		});

		let channels = message.guild.channels.cache.filter(
			(ch) => ch.parentId == server.RegisterParent,
		);

		collector.on("collect", async (button) => {
			if (button.customId === "ChannelLocking") {
				if (
					message.channel
						.permissionsFor(message.guild.id)
						.has(Discord.PermissionsBitField.Flags.SendMessages)
				) {
					message.channel.permissionOverwrites
						.edit(message.guild.id, {
							SendMessages: false,
						})
						.then(async () => {
							await button.reply({
								content: "Kanal başarıyla kilitlendi.",
							});
						});
				} else {
					message.channel.permissionOverwrites
						.edit(message.guild.id, {
							SendMessages: true,
						})
						.then(async () => {
							await button.reply({
								content: "Kanal kilidi açıldı.",
							});
						});
				}
			} else if (button.customId === "RegisterLocking") {
				if (
					!server.BotOwner.includes(message.author.id) &&
					!server.GuildOwner.includes(message.author.id)
				)
					return button.reply({
						content:
							"Bu işlemi gerçekleştirmek için yeterli yetkin yok.",
					});
				if (server.RegisterSystem) {
					server.RegisterSystem = false;
					await server.save();
					channels.forEach((ch) => {
						ch.permissionOverwrites.edit(
							`${server.UnregisteredRole}`,
							{
								// SendMessages: false,
								Connect: false,
							},
						);
					});
					button.reply({
						content:
							"Başarıyla register voice kanalları ve sistemi kilitlendi",
					});
				} else if (!server.RegisterSystem) {
					server.RegisterSystem = true;
					await server.save();

					channels.forEach((ch) => {
						ch.permissionOverwrites.edit(
							`${server.UnregisteredRole}`,
							{
								// SendMessages: true,
								Connect: true,
							},
						);
					});
					button.reply({
						content:
							"Başarıyla register voice kanalları ve sistemi açıldı",
					});
				}
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
	},
};
