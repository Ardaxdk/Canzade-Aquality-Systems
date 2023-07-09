const Discord = require("discord.js");
const notlar = require("../../models/notlar.js");
const { max } = require("moment");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "dağıt",
		usage: "dağıt",
		category: "Owner",
		description:
			"Bulunduğunuz ses kanalındaki üyeleri public odalara dağıtmaya yarar.",
		aliases: ["dağıt", "dagit"],
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
		let voiceChannel = message.member.voice.channelId;
		if (!voiceChannel)
			return message.reply({ content: "Bir ses kanalında olmalısın!" });
		let publicRooms = message.guild.channels.cache.filter(
			(c) =>
				c.parentId === server.PublicParent &&
				c.id !== `${server.AFKRoom}` &&
				c.type === Discord.ChannelType.GuildVoice,
		);
		[...message.member.voice.channel.members.values()].forEach(
			(m, index) => {
				setTimeout(() => {
					if (m.voice.channelId !== voiceChannel) return;
					m.voice.setChannel(publicRooms.random().id);
				}, index * 1000);
			},
		);
		message.reply({
			content: `\`${message.member.voice.channel.name}\` ses kanalında bulunan üyeler public kanallara dağıtılmaya başlandı!`,
		});
	},
};
