const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "yoklama",
		usage: "yoklama",
		category: "Owner",
		description: "Toplantıda bulunan kişilere katıldı permi verir.",
		aliases: ["yoklama", "katıldı"],
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

		if (
			!message.member.voice.channel ||
			message.member.voice.channel.id != server.MeetingChannel
		)
			return message.reply({
				content:
					"Bu komutu başlatabilmek için toplantı kanalında olmalısın.",
			});
		let roles = message.guild.roles.cache.get(`${server.BotCommandRole}`);
		let yetkili = [
			...message.guild.members.cache
				.filter(
					(uye) =>
						!uye.user.bot &&
						uye.roles.highest.position >= roles.position,
				)
				.values(),
		];

		yetkili.forEach(async (member) => {
			if (
				member.voice.channel &&
				member.voice.channel.id == server.MeetingChannel &&
				!member.roles.cache.has(server.JoinMeetingRole)
			)
				await member.roles.add(server.JoinMeetingRole);
			if (
				!member.voice.channel ||
				(member.voice.channel &&
					member.voice.channel.id != server.MeetingChannel &&
					member.roles.cache.has(server.JoinMeetingRole))
			)
				await member.roles.remove(server.JoinMeetingRole);
		});
		message.channel.send({
			content: `
Toplantıda bulunan ${
				yetkili.filter(
					(s) =>
						s.voice.channel &&
						s.voice.channel.id == server.MeetingChannel &&
						!s.roles.cache.has(server.JoinMeetingRole),
				).length
			} yetkiliye katıldı rolü veriliyor.

Toplantıda bulunmayan ${
				yetkili.filter(
					(s) =>
						(!s.voice.channel &&
							s.roles.cache.has(server.JoinMeetingRole)) ||
						(s.voice.channel &&
							s.voice.channel.id == server.MeetingChannel &&
							s.roles.cache.has(server.JoinMeetingRole)),
				).length
			} yetkiliden katıldı rolü alınıyor.`,
		});
	},
};
