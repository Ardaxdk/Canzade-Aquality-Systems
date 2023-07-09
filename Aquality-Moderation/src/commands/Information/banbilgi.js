const Discord = require("discord.js");
const moment = require("moment");
let serverSettings = require("../../models/serverSettings");
require("moment-duration-format");
moment.locale("tr");
const db = require("../../models/cantUnBan.js");
module.exports = {
	conf: {
		name: "ban-bilgi",
		usage: "banbilgi [@userID]",
		category: "Authorized",
		description:
			"Sunucudan yasaklı olan kişinin neden yasaklandığını görürsünüz.",
		aliases: ["banbilgi"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.BanAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
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
					`belirttiğin \`${member.username}\` üyesi bu sunucuda yasaklı değil!`,
				);
				return message.channel.send({ embeds: [embed] });
			} else {
				let text = `${member.username} (\`${
					member.id
				}\`) kullanıcının sunucumuzdan yasaklanma sebebi aşağıda verilmiştir:

"${ban.reason || "Sebep Belirtilmemiş."}"`;
				await db.findOne({ userid: member.id }, async (err, dbres) => {
					if (dbres) {
						text = `:warning: **BU YASAKLAMA <@${
							dbres.mod
						}> TARAFINDAN AÇILAMAZ OLARAK ETİKETLENMİŞTİR.**

${res.username} (\`${
							res.id
						}\`) kullanıcının sunucumuzdan yasaklanma sebebi aşağıda verilmiştir:

"${ban.reason || "Sebep Belirtilmemiş."}"`;
					}
				});
				message.guild
					.fetchAuditLogs({
						type: Discord.AuditLogEvent.MemberBanAdd,
						limit: 100,
					})
					.then((audit) => {
						let user = audit.entries.find(
							(a) => a.target.id === member.id,
						);
						if (user) {
							embed.setDescription(
								text +
									`\n\n Belirttiğin kullanıcı, ${
										user.executor.username
									} (\`${
										user.executor.id
									}\`) tarafından ${moment(
										user.createdAt,
									).format("lll")} tarihinde yasaklanmış.`,
							);
							return message.channel.send({ embeds: [embed] });
						} else {
							embed.setDescription(
								text +
									"\n\n Bilgisini öğrenmek istediğin ban, son 100 yasaklama içerisinde olmadığı için ne yazık ki bilgileri sana gösteremiyorum.",
							);
							return message.channel.send({ embeds: [embed] });
						}
					});
			}
		});
	},
};
