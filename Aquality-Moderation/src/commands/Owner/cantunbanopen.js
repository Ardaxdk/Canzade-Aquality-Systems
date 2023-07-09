const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const db = require("../../models/cantUnBan.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "açılmazbanaç",
		usage: "infazaç [@user]",
		category: "Owner",
		description:
			"Belirttiğiniz kullanıcının kaldırılamaz banını kaldırmaya yarar.",
		aliases: ["açılmazban-kaldır", "açılmazbanaç", "infazaç", "infazac"],
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
		let embed = new Discord.EmbedBuilder();
		embed.setColor("Random");
		embed.setAuthor({
			name: message.author.username,
			iconURL: message.author.displayAvatarURL({ dynamic: true }),
		});

		const whoisuseridd = args[0];
		if (isNaN(whoisuseridd))
			return client.send(
				"Lütfen geçerli bir kullanıcı ID'si giriniz.",
				message.author,
				message.channel,
			);
		const member = await client.users.fetch(whoisuseridd);
		const fetchBans = message.guild.bans.fetch();
		fetchBans.then(async (bans) => {
			let ban = await bans.find((a) => a.user.id === member.id);
			if (!ban) {
				embed.setDescription(
					`\`${member.username}\` isimli üye bu sunucudan yasaklı değil.!`,
				);
				return message.channel.send({ embeds: [embed] });
			} else {
				await db.findOne({ user: member.id }, async (err, doc) => {
					if (!doc) {
						embed.setDescription(
							`**${member.username}** kullanıcısının yasağı zaten kalıcı olarak işaretlenmemiş.`,
						);
						return message.channel.send({ embeds: [embed] });
					} else {
						embed.setDescription(
							`Bu komutu kullanmak için yeterli yetkilere sahip değilsin.`,
						);
						doc.delete().catch((e) => console.log(e));
						embed.setDescription(
							`**${member.username}** kullanıcısının açılmaz ban etiketi kaldırıldı.`,
						);
						return message.channel.send({ embeds: [embed] });
					}
				});
			}
		});
	},
};
