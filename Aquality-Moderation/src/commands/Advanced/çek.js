const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "move",
		usage: "çek [@user]",
		category: "Global",
		description: "Belirttiğiniz kullanıcıyı kanalınıza çekersiniz.",
		aliases: ["çek", "cek"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		let user =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!message.member.voice.channel)
			return client.send(
				"Bir kullanıcıyı sese çekmek için ilk önce senin ses kanallarında bulunmak gerekiyor!",
				message.author,
				message.channel,
			);
		if (!user)
			return client.send(
				"Bir kullanıcıyı sese çekmek istiyorsan o kullanıcıyı belirtmen gerekir.",
				message.author,
				message.channel,
			);
		if (!user.voice.channel)
			return client.send(
				"Etiketlediğin kullanıcı her hangi sesli bir kanalda bulunmuyor.",
				message.author,
				message.channel,
			);
		if (!message.member.voice.channel === user.voice.channel)
			return client.send(
				"Etiketlediğiniz kullanıcı ile aynı sesli kanalda bulunuyorsunuz.",
				message.author,
				message.channel,
			);
		//    if(message.member.roles.highest.rawPosition < user.roles.highest.rawPosition) return client.send("Rolleri senden üst ve ya aynı olan kullanıcıları ses odalarında taşıyamazsın.", message.author, message.channel)
		if (user.id == message.author.id)
			return client.send("cidden mi?", message.author, message.channel);
		if (
			server.MoveAuth.some((role) => message.member.roles.cache.has(role))
		) {
			message.guild.members.cache
				.get(user.id)
				.voice.setChannel(message.member.voice.channel);
			message.react(
				client.emojis.cache.find(
					(x) => x.name == client.settings.emojis.yes_name,
				),
			);
		} else {
			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setCustomId("GİT")
					.setLabel("GİT")
					.setStyle(Discord.ButtonStyle.Success),
				new Discord.ButtonBuilder()
					.setCustomId("GİTME")
					.setLabel("GİTME")
					.setStyle(Discord.ButtonStyle.Danger),
			);

			let msg = await message.channel.send({
				content: `${user}, ${message.member} **üyesi sizi \`${message.member.voice.channel.name}\` odasına çekmek istiyor, onaylıyor musunuz?**`,
				components: [row],
			});

			var filter = (button) => button.user.id === user.id;
			const collector = msg.createMessageComponentCollector({
				filter,
				time: 30000,
			});

			collector.on("collect", async (button) => {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				button.deferUpdate();
				msg.edit({ components: [row] });
				if (button.customId === "GİT") {
					message.guild.members.cache
						.get(user.id)
						.voice.setChannel(message.member.voice.channel);

					msg.edit({
						content: `${user}, ${message.member} **Kişisi sizi \`${message.member.voice.channel.name}\` odasına çekmek istiyor, onaylıyor musunuz?**
\`Kullanıcı odaya çekildi.\``,
						components: [],
					});
				} else if (button.customId === "GİTME") {
					msg.edit({
						content: `${user}, ${message.member} **Kişisi sizi \`${message.member.voice.channel.name}\` odasına çekmek istiyor, onaylıyor musunuz?**
\`Kullanıcı işlemi reddetti.\``,
						components: [],
					});
				}
			});

			collector.on("end", async (button) => {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				msg.edit({ components: [row] });
			});
		}
	},
};
