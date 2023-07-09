const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "git",
		usage: "git [@user]",
		category: "Global",
		description: "belirttiğiniz kullanıcının kanalına gidersiniz.",
		aliases: ["go"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		let member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!message.member.voice.channel)
			return client.send(
				"Bir ses kanalına bağlı olmalısın!",
				message.author,
				message.channel,
			);
		if (!member)
			return client.send(
				"Kullanıcı belirtmen gerekli!",
				message.author,
				message.channel,
			);
		if (!member.voice.channel)
			return client.send(
				"Kullanıcı ses kanallarında bulunmuyor!",
				message.author,
				message.channel,
			);
		if (message.member.voice.channel.id === member.voice.channel.id)
			return client.send(
				"Kullanıcı ile aynı odada bulunuyorsunuz!",
				message.author,
				message.channel,
			);
		if (member.id == message.author.id)
			return client.send("Cidden mi?", message.author, message.channel);

		if (
			server.MoveAuth.some((role) => message.member.roles.cache.has(role))
		) {
			message.member.voice.setChannel(member.voice.channel);
			message.react(
				client.emojis.cache.find(
					(x) => x.name == client.settings.emojis.yes_name,
				),
			);
		} else {
			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setCustomId("evet")
					.setLabel("EVET")
					.setStyle(Discord.ButtonStyle.Success),
				new Discord.ButtonBuilder()
					.setCustomId("hayır")
					.setLabel("HAYIR")
					.setStyle(Discord.ButtonStyle.Danger),
			);

			let msg = await message.channel.send({
				content: `${member}, ${message.author} **Kişisi bulunduğunuz odaya gelmek istiyor, onaylıyor musunuz?**`,
				components: [row],
			});

			var filter = (button) => button.user.id === member.id;
			const collector = msg.createMessageComponentCollector({
				filter,
				time: 30000,
			});

			collector.on("collect", async (interaction) => {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				interaction.deferUpdate();
				msg.edit({ components: [row] });
				if (interaction.customId === "evet") {
					message.member.voice.setChannel(member.voice.channel);
					msg.edit({
						content: `${member}, ${message.author} **Kişisi bulunduğunuz odaya gelmek istiyor, onaylıyor musunuz?**
\`Kullanıcı odaya çekildi.\``,
						components: [],
					});
				} else if (interaction.customId === "hayır") {
					msg.edit({
						content: `${member}, ${message.author} **Kişisi bulunduğunuz odaya gelmek istiyor, onaylıyor musunuz?**
\`Kullanıcı işlemi reddetti.\``,
						components: [],
					});
				}
			});

			collector.on("end", async (interaction) => {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				msg.edit({ components: [row] });
				msg.edit({
					content: `${member}, ${message.author} **Kişisi bulunduğunuz odaya gelmek istiyor, onaylıyor musunuz?**
\`Süre dolduğu için işlem iptal edildi.\``,
					components: [],
				});
			});
		}
	},
};
