const VoiceModel = require("../models/voiceModel");
const Discord = require("discord.js");
const conf = require("../../config");
let serverSettings = require("../models/serverSettings");
const { scheduleJob } = require("node-schedule");
const moment = require("moment");
require("moment-duration-format");
module.exports = async (client) => {
	let server = await serverSettings.findOne({});
	const channel = await client.channels.fetch(server.LeaderboardChannel);
	if (!channel) return "Leaderboards kanalı bulunamadı.";
	const textMessage = await channel.messages.fetch(conf.LEADERBOARD_TEXT);
	if (!textMessage) return "Yazı leaderboards mesajı bulunamadı.";

	const voiceMessage = await channel.messages.fetch(conf.LEADERBOARD_VOICE);
	if (!voiceMessage) return "Sesli leaderboards mesajı bulunamadı.";

	const voiceList = await VoiceModel.find({ guildID: channel.guild.id })
		.sort("-voice")
		.limit(30);
	const textList = await VoiceModel.find({ guildID: channel.guild.id })
		.sort("-messages")
		.limit(30);

	let voiceDescription = "";
	let textDescription = "";

	for (let i = 0; i < voiceList.length; i++) {
		const model = voiceList[i];
		const user = channel.client.users.cache.get(model.userID);
		const mention = user ? user.toString() : model.userID;
		voiceDescription += `\` ${i + 1}. \` \`${moment
			.duration(model.voice)
			.format("H [saat], m [dk]")}\` ile ${mention}\n`;
	}

	for (let i = 0; i < textList.length; i++) {
		const data = textList[i];
		const user = channel.client.users.cache.get(data.userID);
		const mention = user ? user.toString() : data.userID;
		textDescription += `\` ${i + 1}. \` - \`${
			data.messages
		} mesaj\` ile ${mention}\n`;
	}

	const voiceembed = new Discord.EmbedBuilder().setDescription(`
Top 30 Ses tablosu aşağıda listelenmiştir. (Tüm Zamanlar)

${voiceDescription}
_Son Güncelleme:_ <t:${Math.floor(Date.now() / 1000)}:R>`);

	voiceMessage.edit({ embeds: [voiceembed] });

	const textembed = new Discord.EmbedBuilder().setDescription(`
Top 30 Mesaj tablosu aşağıda listelenmiştir. (Tüm Zamanlar)

${textDescription}
_Son Güncelleme:_ <t:${Math.floor(Date.now() / 1000)}:R>`);

	textMessage.edit({ embeds: [textembed] });

	scheduleJob("*/1 * * * *", async () => {
		const voiceembed = new Discord.EmbedBuilder().setDescription(`
Top 30 Ses tablosu aşağıda listelenmiştir. (Tüm Zamanlar)

${voiceDescription}
_Son Güncelleme:_ <t:${Math.floor(Date.now() / 1000)}:R>`);

		voiceMessage.edit({ embeds: [voiceembed] });

		const textembed = new Discord.EmbedBuilder().setDescription(`
Top 30 Mesaj tablosu aşağıda listelenmiştir. (Tüm Zamanlar)

${textDescription}
_Son Güncelleme:_ <t:${Math.floor(Date.now() / 1000)}:R>`);

		textMessage.edit({ embeds: [textembed] });
	});
};
