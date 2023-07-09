const Discord = require("discord.js");
const cezalar = require("../../models/cezalı.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "roldenetim",
		usage: "roldenetim [@rol]",
		category: "Management",
		description: "Belirttiğiniz rolün üye bilgilerini gösterir.",
		aliases: ["rol-denetim", "rol-say"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let roles =
			args.length > 0
				? message.mentions.roles.first() ||
				  message.guild.roles.cache.get(args[0])
				: message.guild.roles.cache.get(`${server.BotCommandRole}`);
		//TODO: presence.status bozuk
		let offlineMembers = message.guild.members.cache.filter((x) => {
			return x.roles.cache.has(roles.id) && !x.presence;
		});
		let voiceMembers = message.guild.members.cache.filter((x) => {
			return x.roles.cache.has(roles.id) && x.voice.channel;
		});
		let notVoiceMembers = message.guild.members.cache.filter((x) => {
			return x.roles.cache.has(roles.id) && !x.voice.channel;
		});
		message.channel.send({
			content:
				"```Roldeki Offline Kullanıcılar(" +
				offlineMembers.size +
				"):\n```" +
				offlineMembers.map((x) => "<@" + x.id + ">").join(",") +
				"",
		});
		message.channel.send({
			content:
				"```Roldeki Seste Olan Kullanıcılar(" +
				voiceMembers.size +
				"):\n```" +
				voiceMembers.map((x) => "<@" + x.id + ">").join(",") +
				"",
		});
		message.channel.send({
			content:
				"```Roldeki Seste Olmayan Kullanıcılar(" +
				notVoiceMembers.size +
				"):\n```" +
				notVoiceMembers.map((x) => "<@" + x.id + ">").join(",") +
				"",
		});
	},
};
