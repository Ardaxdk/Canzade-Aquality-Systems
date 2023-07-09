const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "kontrol",
		usage: "kontrol",
		category: "Owner",
		description:
			"Sunucudaki rolleri düzgün olmayan kullanıcıları düzeltmenize yarar.",
		aliases: ["kontrol"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!server.BotOwner.includes(message.author.id) &&
			!server.GuildOwner.includes(message.author.id)
		)
			return;

		let rolsuz = message.guild.members.cache.filter(
			(m) =>
				m.roles.cache.filter((r) => r.id !== message.guild.id).size ==
				0,
		);
		let tagolan = message.guild.members.cache.filter(
			(s) =>
				s.user.username.includes(server.Tag) &&
				server.FamilyRole.some((role) => !s.roles.cache.has(role)),
		);
		let tagolmayan = message.guild.members.cache.filter(
			(s) =>
				server.FamilyRole.some((role) => s.roles.cache.has(role)) &&
				!s.user.username.includes(server.Tag),
		);

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("taglı")
				.setLabel("Taglı kontrol")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("rolsüz")
				.setLabel("Rolsüz kontrol")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("CANCEL")
				.setLabel("İptal")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Random")
			.setDescription(
				`
\`${message.guild.name}\` sunucusundaki kontrolleri yapmak için aşağıdaki buttonları kullanman yeterli olacaktır.
`,
			)
			.addFields([
				{
					name: "Tagı olup rolü olmayan",
					value: `
\`\`\`fix
${tagolan.size} kişi
\`\`\`
`,
					inline: true,
				},
				{
					name: "Tagı olmayıp rolü olan",
					value: `
\`\`\`fix
${tagolmayan.size} kişi
\`\`\`
`,
					inline: true,
				},
				{
					name: "Hiç Bir Rolü bulunmayan",
					value: `
\`\`\`fix
${rolsuz.size} kişi
\`\`\`
`,
					inline: true,
				},
			]);

		let msg = await message.channel.send({
			embeds: [embed],
			components: [row],
		});
		var filter = (button) => button.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 30000,
		});

		collector.on("collect", async (button) => {
			if (button.customId === "taglı") {
				row.components[0].setDisabled(true);
				msg.edit({ components: [row] });

				message.guild.members.cache
					.filter(
						(s) =>
							s.user.username.includes(server.Tag) &&
							!s.roles.cache.has(server.FamilyRole),
					)
					.map((x) => x.roles.add(server.FamilyRole));
				message.guild.members.cache
					.filter(
						(s) =>
							server.FamilyRole.some((role) =>
								s.roles.cache.has(role),
							) && !s.user.username.includes(server.Tag),
					)
					.map((x) => x.roles.remove(server.FamilyRole));
				button.reply({
					content: `Tagı olup rolü olmayan ${tagolan.size} kişiye taglı rolünü verdim. Tagı olmayıp rolü olan ${tagolmayan.size} kişiden taglı rolünü aldım.`,
				});
			} else if (button.customId === "rolsüz") {
				row.components[1].setDisabled(true);
				msg.edit({ components: [row] });
				rolsuz.forEach((r) => {
					r.roles.add(server.UnregisteredRole);
				});
				button.reply({
					content: `Sunucuda herhangi bir role sahip olmayan ${rolsuz.size} kişiye kayıtsız rolünü verdim.`,
				});
			} else if (button.customId === "CANCEL") {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				row.components[2].setDisabled(true);
				msg.edit({ components: [row] });
				button.reply({ content: "İşlem iptal edildi!" });
			}
		});
	},
};
