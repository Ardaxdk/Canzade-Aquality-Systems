const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "Bağlantı-Kes",
		usage: "kes [@user]",
		category: "Global",
		description: "Belirttiğiniz kullanıcıyı ses kanalından atarsınız.",
		aliases: ["kes", "voicekick", "voice-kick", "at", "bağlantıkes"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.MoveAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let user =
			message.mentions.members.first() ||
			(await client.üye(args[0], message.guild));
		if (!user)
			return client.send(
				"Bağlantısını kesmek istediğin kullanıcıyı belirtmelisin!",
				message.author,
				message.channel,
			);
		if (!user.voice.channel)
			return client.send(
				"Bağlantısını kesmek istediğiniz kullanıcı sesli odalarda bulunmuyor.",
				message.author,
				message.channel,
			);
		if (user.voice.channel.parentId !== server.RegisterParent)
			return client.send(
				`Yalnızca "V.Confirmed" odalarından birisinin bağlantısını kesebilirsiniz! Bu kullanıcı şu an "${user.voice.channel.name}" kanalında bulunmakta.`,
				message.author,
				message.channel,
			);

		if (
			message.member.roles.highest.rawPosition <
			user.roles.highest.rawPosition
		)
			return client.send(
				"Rolleri senden yüksek birinin ses kanallarında ki bağlantısını kesemezsin.",
				message.author,
				message.channel,
			);
		const attımknk = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(
				"<@" +
					user +
					"> üyesi " +
					user.voice.channel.name +
					" ses kanalından çıkarıldı.",
			)
			.setColor("Random");
		user.voice.disconnect();
		message.channel
			.send({ embeds: [attımknk] })
			.then((message) => {
				setTimeout(() => {
					message.delete();
				}, 5000);
			})
			.then((m) =>
				message.react(
					client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.yes_name,
					),
				),
			);
	},
};
