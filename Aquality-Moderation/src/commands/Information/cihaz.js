const Discord = require("discord.js");
module.exports = {
	conf: {
		name: "cihaz",
		usage: "cihaz [@user]",
		category: "Authorized",
		description:
			"Belirttiğiniz kişinin hangi platformdan giriş yaptığını görürsünüz.",
		aliases: ["cıhaz"],
	},

	async run(client, message, args) {
		if (
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);

		if (!member)
			return client.send(
				"Belirttiğin üyeyi bulamıyorum.",
				message.author,
				message.channel,
			);
		if (!member.presence || member.presence.status == "offline")
			return client.send(
				`\`${member.user.username}\` kullanıcısı çevrimdışı olduğundan dolayı cihaz bilgisini tespit edemiyorum.`,
				message.author,
				message.channel,
			);
		let cihaz = "";
		let ha = Object.keys(member.presence.clientStatus);
		if (ha[0] == "mobile") cihaz = "Mobil Telefon";
		if (ha[0] == "desktop") cihaz = "Masaüstü Uygulama";
		if (ha[0] == "web") cihaz = "İnternet Tarayıcısı";

		const embed = new Discord.EmbedBuilder().setColor("Random").setAuthor({
			name: message.author.username,
			iconURL: message.author.avatarURL({ dynamic: true }),
		}).setDescription(`
${member.user.username} kullanıcısının kullandığı cihaz;
\`•\` ${cihaz}`);
		message.channel.send({ embeds: [embed] });
	},
};
