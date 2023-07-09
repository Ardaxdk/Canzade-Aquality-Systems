const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "yetkili-durum",
		usage: "ydurum",
		category: "Owner",
		description: "Yetkili durumunu gösterir.",
		aliases: ["yetkilidurum", "ytdurum", "ydurum"],
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
		let enAltYetkiliRolü = message.guild.roles.cache.get(
			`${server.BotCommandRole}`,
		);
		let yetkili = message.guild.members.cache.filter(
			(uye) =>
				!uye.user.bot &&
				uye.roles.highest.position >= enAltYetkiliRolü.position,
		).size;
		let sesteolmayan = message.guild.members.cache.filter(
			(uye) =>
				!uye.user.bot &&
				uye.roles.highest.position >= enAltYetkiliRolü.position &&
				!uye.voice.channel &&
				uye.presence &&
				uye.presence.status !== "offline",
		).size;
		let sesteolan = message.guild.members.cache.filter(
			(uye) =>
				!uye.user.bot &&
				uye.roles.highest.position >= enAltYetkiliRolü.position &&
				uye.voice.channel,
		).size;
		const avatar = new Discord.EmbedBuilder()

			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(
				`
• Sunucumuzda bulunan toplam yetkili sayısı: \`${yetkili}\`
• Sunucumuzda aktif olup seste olmayan yetkili sayısı: \`${sesteolmayan}\`
• Sunucumuzda ses kanallarında bulunan yetkili sayısı: \`${sesteolan}\`
`,
			)
			.setColor("Random")
			.setThumbnail(message.guild.iconURL({ dynamic: true }));
		message.channel.send({ embeds: [avatar] }).then((message) => {
			setTimeout(() => {
				message.delete();
			}, 10000);
		});
	},
};
