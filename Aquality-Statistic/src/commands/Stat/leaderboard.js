const Discord = require("discord.js");
const VoiceModel = require("../../models/voiceModel");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
	conf: {
		name: "top",
		usage: ".top",
		category: "Global",
		description: "Sunucu ses ve mesaj top verilerinizi görüntülersiniz.",
		aliases: ["top"],
	},

	async run(client, message, args) {
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({
					display: true,
				}),
			})
			.setColor("Aqua");
		let description = "";
		const isChat = args.length > 0 && args[0] === "chat";

		const models = await VoiceModel.find({
			guildID: message.guild.id,
		}).sort(`-${isChat ? "messages" : "voice"}`);
		const topModels = models.slice(0, 25);

		for (let i = 0; i < topModels.length; i++) {
			const model = topModels[i];
			const user = message.client.users.cache.get(model.userID);
			const mention = user ? user.toString() : model.userID;
			description += isChat
				? `\`${i + 1}.\` ${mention}: \`${model.messages} mesaj\`${
						model.userID === message.author.id ? "**(Siz)**" : ""
				  }\n`
				: `\`${i + 1}.\` ${mention}: \`${moment
						.duration(model.voice)
						.format("H [saat], m [dk]")}.\`${
						model.userID === message.author.id ? "**(Siz)**" : ""
				  }\n`;
		}

		const self = models.find((x) => x.userID === message.author.id);
		const index = models.indexOf(self);

		embed.setDescription(
			(isChat
				? "Top 25 Chat sıralaması aşağıda belirtilmiştir.\n\n" +
				  description
				: "**30** günlük **ses** Top 25 sıralaması aşağıda belirtilmiştir.\n\n" +
				  description) +
				"\n" +
				(index == -1 ? "" : `Siz ${index + 1}. sırada bulunuyorsunuz.`),
		);

		message.reply({ embeds: [embed] });
	},
};
