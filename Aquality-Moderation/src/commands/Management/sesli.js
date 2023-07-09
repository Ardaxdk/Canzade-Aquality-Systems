const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "Sesli",
		usage: "sesli",
		category: "Management",
		description: "Sunucunun ses aktifliği detaylarını gösterir.",
		aliases: ["sesli"],
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
		let pub = message.guild.channels.cache
			.filter(
				(x) =>
					x.parentId == server.PublicParent &&
					x.type == Discord.ChannelType.GuildVoice,
			)
			.map((u) => u.members.size)
			.reduce((a, b) => a + b);
		let ses = message.guild.channels.cache
			.filter((channel) => channel.type == Discord.ChannelType.GuildVoice)
			.map(
				(channel) =>
					channel.members.filter((member) => !member.user.bot).size,
			)
			.reduce((a, b) => a + b);
		let bot = message.guild.channels.cache
			.filter((channel) => channel.type == Discord.ChannelType.GuildVoice)
			.map(
				(channel) =>
					channel.members.filter((member) => member.user.bot).size,
			)
			.reduce((a, b) => a + b);
		let tagges = message.guild.members.cache.filter((x) => {
			return (
				x.user.username.includes(server.Tag) &&
				x.voice.channel &&
				server.BotCommandRole.some(
					(role) => !x.roles.cache.has(role),
				) &&
				!x.user.bot
			);
		}).size;
		let notag = message.guild.members.cache.filter((x) => {
			return (
				!x.user.username.includes(server.Tag) &&
				x.voice.channel &&
				!x.user.bot
			);
		}).size;
		let yetkili = message.guild.members.cache.filter((x) => {
			return (
				x.user.username.includes(server.Tag) &&
				x.voice.channel &&
				server.BotCommandRole.some((role) => x.roles.cache.has(role)) &&
				!x.user.bot
			);
		}).size;
		let owner = message.guild.members.cache.filter((x) => {
			return (
				x.voice.channel &&
				server.OwnerRole.some((role) => x.roles.cache.has(role)) &&
				!x.user.bot
			);
		}).size;
		let stream = message.guild.members.cache.filter((x) => {
			return x.voice.streaming;
		}).size;
		let mic = message.guild.members.cache.filter((x) => {
			return x.voice.selfMute == true;
		}).size;
		let kulaklik = message.guild.members.cache.filter((x) => {
			return x.voice.selfDeaf == true;
		}).size;
		let count = 1;
		let category = message.guild.channels.cache
			.filter((x) => x.type === Discord.ChannelType.GuildCategory)
			.sort((a, b) =>
				Number(
					message.guild.members.cache.filter(
						(x) =>
							x.voice.channel &&
							x.voice.channel.parentId === b.id,
					).size -
						Number(
							message.guild.members.cache.filter(
								(x) =>
									x.voice.channel &&
									x.voice.channel.parentId === a.id,
							).size,
						),
				),
			)
			.map(
				(c, index) =>
					`${count++}. **#${c.name}**: **${
						c.members.filter(
							(s) =>
								s.voice.channel &&
								s.voice.channel.parentId === c.id,
						).size
					}**`,
			)
			.splice(0, 3)
			.join("\n");

		if (!args[0]) {
			const embed = new Discord.EmbedBuilder().setColor("Random")
				.setDescription(`
Sesli kanallarda toplam **${ses}** kişi var !
───────────────
Public odalarda **${pub}** kişi var !
Ses kanallarında **${notag}** normal kullanıcı var !
Ses kanallarında **${tagges}** taglı kullanıcı var !
Ses kanallarında toplam **${yetkili}** yetkili var !
Ses kanallarına toplam **${owner}** kurucu var !`);
			return message.reply({ embeds: [embed] });
		}
		if (args[0] == "detay") {
			const embed = new Discord.EmbedBuilder().setColor("Random")
				.setDescription(`
Sesli kanallarda toplam **${ses}** kişi var !
───────────────
Public odalarda **${pub}** kişi var !
Ses kanallarında **${notag}** normal kullanıcı var !
Ses kanallarında **${tagges}** taglı kullanıcı var !
Ses kanallarında toplam **${yetkili}** yetkili var !
Ses kanallarına toplam **${owner}** kurucu var !
───────────────
Ses kanallarında **${stream}** kişi yayın yapıyor.
Mikrofonu Kapalı: **${mic}**
Kulaklığı Kapalı: **${kulaklik}**
Bot: **${bot}**
───────────────
Top 3 kategori sırası;
${category}
`);
			return message.reply({ embeds: [embed] });
		}
	},
};
