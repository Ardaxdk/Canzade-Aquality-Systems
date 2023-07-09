const InviteModel = require("../../models/inviter");
const Discord = require("discord.js");

module.exports = {
	conf: {
		name: "topinvite",
		usage: ".topinv",
		category: "Global",
		description: "Sunucu top10 invite listesini görürsünüz.",
		aliases: [
			"top-invites",
			"top-inv",
			"topinv",
			"invtop",
			"inv-top",
			"invitetop",
		],
	},

	async run(client, message, args) {
		const models = await InviteModel.find({
			guildID: message.guild.id,
		}).sort({ total: -1 });
		const topModels = models.slice(0, 25);
		let description = "";
		for (let i = 0; i < topModels.length; i++) {
			const model = topModels[i];
			const user = message.client.users.cache.get(model.userID);
			const mention = user ? user.toString() : model.userID;
			description += `\`${i + 1}.\` ${mention}: \`${
				model.total
			} Davet\` ${
				model.userID === message.author.id ? "**(Siz)**" : ""
			}\n`;
		}

		const self = models.find((x) => x.userID === message.author.id);
		const index = models.indexOf(self);
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({
					display: true,
				}),
			})
			.setDescription(
				"**30** günlük Top 25 davet sıralaması aşağıda belirtilmiştir.\n\n" +
					description +
					"\n" +
					(index == -1
						? ""
						: `Siz ${index + 1}. sırada bulunuyorsunuz.`),
			)
			.setColor("Aqua");

		message.reply({ embeds: [embed] });
	},
};
