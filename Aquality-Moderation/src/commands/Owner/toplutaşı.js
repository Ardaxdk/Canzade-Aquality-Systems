const data = require("../../models/cezalar.js");
const ms = require("ms");
const Discord = require("discord.js");
const mutes = require("../../models/voicemute.js");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
module.exports = {
	conf: {
		name: "toplu-taşı",
		usage: "toplutaşı [#kanalID] [#taşınılacak kanalID]",
		category: "Owner",
		description:
			"Belirttiğiniz kanaldaki kullanıcıları belirttiğiniz kanala taşır.",
		aliases: ["toplutaşı", "ttaşı", "ttasi"],
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
		if (!message.member.voice.channel)
			return client.send(
				"Toplu taşıma işlemi uygulamadan önce bir ses kanalına bağlı olmalısın!",
				message.author,
				message.channel,
			);
		let channelone = message.guild.channels.cache.find(
			(a) =>
				a.type === Discord.ChannelType.GuildVoice && a.id === args[0],
		);
		let channeltwo = message.guild.channels.cache.find(
			(a) =>
				a.type === Discord.ChannelType.GuildVoice && a.id === args[1],
		);
		if (!channelone)
			return client.send(
				"Hangi kanaldaki üyeleri toplu taşımak istiyorsun",
				message.author,
				message.channel,
			);
		if (!channeltwo)
			return client.send(
				"Üyeleri hangi kanala taşımak istiyorsun",
				message.author,
				message.channel,
			);
		if (channelone.length < 1)
			return client.send(
				"Taşımak istediğiniz kanalda hiç üye olmadığı için işlem iptal edildi.",
				message.author,
				message.channel,
			);
		channelone.members.map((a) => {
			a.voice.setChannel(channeltwo.id);
		});
		await client.send(
			`**${message.member.voice.channel.name}** kanalındaki üyeler **${channeltwo.name}** kanalına taşındı`,
			message.author,
			message.channel,
		);
		message.react(
			client.emojis.cache.find(
				(x) => x.name === client.settings.emojis.yes_name,
			),
		);
	},
};
