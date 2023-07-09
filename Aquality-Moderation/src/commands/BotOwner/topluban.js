const Discord = require("discord.js");

module.exports = {
	conf: {
		name: "topluban",
		usage: "topluban [userID]",
		category: "BotOwner",
		description: "ID belirttiğiniz kullanıcıları toplu banlar.",
		aliases: ["topluban"],
	},

	async run(client, message, args) {
		if (!client.settings.BOT_OWNERS.includes(message.author.id)) return;

		if (args.length < 1)
			return message.reply({
				content:
					"birden fazla ID girmelisin. Unutma sadece ID ile ban atabilirsin",
			});
		const members = args
			.filter((id) => message.guild.members.cache.has(id))
			.map((id) => message.guild.members.cache.get(id));
		if (members.length < 1)
			return message.reply({
				content:
					"Lütfen girdiğin ID'lerin doğruluğundan emin ol ve yeniden dene",
			});

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("banla")
				.setLabel("✅")
				.setStyle(Discord.ButtonStyle.Success),
		);

		const prompt = await message.channel.send({
			content: `${members
				.map((member, idx) => `**${idx + 1}. ${member.toString()}**`)
				.join("\n")}\nBu üyeleri banlamak istiyor musun?`,
			components: [row],
		});

		var filter = (interaction) => interaction.user.id === message.author.id;
		const collector = prompt.createMessageComponentCollector({
			filter,
			time: 10000,
		});

		collector.on("collect", async (interaction) => {
			interaction.deferUpdate();
			if (interaction.customId === "banla") {
				row.components[0].setDisabled(true);
				await prompt.edit({
					content: `${client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.yes_name,
					)} ${members.length} adet kullanıcı başarıyla yasaklandı.`,
				});
				for (const member of members) {
					if (member.bannable)
						await member.ban({
							deleteMessageSeconds: 7 * 24 * 60 * 60,
							reason: "Toplu ban",
						});
				}
			}
		});

		collector.on("end", (_, reason) => {
			console.log("end", reason);
			if (reason === "time")
				prompt.edit({
					content: "10 saniye geçtiği için işlem iptal edildi.",
					components: [],
				});
		});
	},
};
