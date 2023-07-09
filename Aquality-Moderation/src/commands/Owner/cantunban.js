const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const db = require("../../models/cantUnBan.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "infaz",
		usage: "infaz [@user]",
		category: "Owner",
		description:
			"Belirttiğiniz kullanıcının yasaklamasını kaldırılamaz hale getirir.",
		aliases: ["açılmazban", "infaz"],
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
		embed.setColor("Random").setAuthor({
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
					`\`${member.username}\` isimli üye bu sunucudan yasaklı değil.`,
				);
				return message.channel.send({ embeds: [embed] });
			} else {
				await db.findOne({ user: member.id }, async (err, doc) => {
					if (doc) {
						embed.setDescription(
							`**${member.username}** kullanıcısı zaten <@${doc.mod}> yetkilisi tarafından kalıcı olarak yasaklandı.`,
						);
						return message.channel.send({ embeds: [embed] });
					} else {
						message.guild
							.fetchAuditLogs({
								type: Discord.AuditLogEvent.MemberBanAdd,
								limit: 100,
							})
							.then((audit) => {
								let user = audit.entries.find(
									(a) => a.target.id === member.id,
								);
								if (
									user &&
									user.executor.id !== message.author.id
								)
									return;
								if (!user)
									return client.send(
										`Bu üye son 100 yasaklama içinde bulunamıyor.`,
										message.author,
										message.channel,
									);
							});
						const newBanData = new db({
							userID: member.id,
							mod: message.author.id,
							sebep: ban.reason || "Sebep Belirtilmedi.",
						});
						await newBanData.save().catch((e) => console.log(e));
					}
					embed.setDescription(
						`**${member.username}** kullanıcısının yasağı açılamaz olarak işaretlendi.`,
					);
					message.channel.send({ embeds: [embed] });
					message.react(
						"" +
							client.emojis.cache.find(
								(x) =>
									x.name === client.settings.emojis.yes_name,
							) +
							"",
					);
				});
			}
		});
	},
};
