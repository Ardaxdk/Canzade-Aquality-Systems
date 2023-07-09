const InviteModel = require("../../models/inviter");
const Discord = require("discord.js");

module.exports = {
	conf: {
		name: "davet",
		usage: ".invite",
		category: "Global",
		description: "Invite sayınızı görmenize yarar.",
		aliases: ["invites", "rank", "davetlerim", "invite"],
	},

	async run(client, message, args) {
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;

		const inviteData = await InviteModel.find({
			userID: member.user.id,
			guildID: message.guild.id,
		});

		let inviteToplam = "";
		for (let i = 0; i < inviteData.length; i++) {
			const data = inviteData[i];
			inviteToplam += `Toplam **${data.total}** davete sahip, **${data.regular}** bütün, **${data.bonus}** fake, **${data.leave}** ayrılan, **${data.fake}** sahte kullanıcı`;
		}

		const embed = new Discord.EmbedBuilder()
			.setColor("Aqua")
			.setAuthor({
				name: member.user.username,
				iconURL: member.user.avatarURL({ dynamic: true }),
			})
			.setFooter({ text: `Can was here!` })
			.setTimestamp()
			.setDescription(inviteToplam || "veri bulunamadı");

		message.channel.send({ embeds: [embed] });
	},
};
