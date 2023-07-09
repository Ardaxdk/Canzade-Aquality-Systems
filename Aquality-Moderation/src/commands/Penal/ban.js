const moment = require("moment");
require("moment-duration-format");
const Discord = require("discord.js");
const data = require("../../models/cezalar.js");
const sunucu = require("../../models/sunucu-bilgi.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "ban",
		usage: "ban [@user] [sebep]",
		category: "Authorized",
		description: "Belirttiğiniz kişiyi banlarsınız.",
		aliases: ["ban"],
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
		if (args.length < 1)
			return client.send(
				"Bir kullanıcı etiketleyin veya kullanıcı ID giriniz.",
				message.author,
				message.channel,
			);
		let user =
			message.mentions.users.first() ||
			(await client.users.fetch(args[0]).catch((e) => console.log(e)));
		if (!user)
			return client.send(
				"Belirttiğiniz kullanıcı geçerli değil.",
				message.author,
				message.channel,
			);
		if (user.id === message.author.id)
			return client.send(
				"Kendi kendini banlayamazsın.",
				message.author,
				message.channel,
			);
		if (
			message.guild.members.cache.has(user.id) &&
			message.guild.members.cache
				.get(user.id)
				.permissions.has(Discord.PermissionsBitField.Flags.ViewAuditLog)
		)
			return client.send(
				"Üst yetkiye sahip kişileri yasaklayamazsın!",
				message.author,
				message.channel,
			);
		if (
			message.guild.members.cache.has(user.id) &&
			message.member.roles.highest.position <=
				message.guild.members.cache.get(user.id).roles.highest.position
		)
			return client.send(
				"Kendi rolünden yüksek kişilere işlem uygulayamazsın!",
				message.author,
				message.channel,
			);
		let reason = args.slice(1).join(" ") || "Sebep Belirtilmedi.";
		let id = await data.countDocuments().exec();
		const fetchBans = message.guild.bans.fetch();
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setImage(
				"https://cdn.discordapp.com/attachments/839954721187037184/848339514052706344/can.gif",
			)
			.setColor("Random")
			.setDescription(
				`**${user.username}** kullanıcısı **${
					message.author.username
				}** tarafından başarıyla sunucudan yasaklandı. (Ceza Numarası: \`#${
					id + 1
				}\`)`,
			);

		fetchBans.then(async (bans) => {
			let ban = await bans.find((a) => a.user.id === user.id);
			if (ban)
				return client.send(
					`**${user.username}** kullanıcısı zaten yasaklanmış durumda.`,
					message.author,
					message.channel,
				);
			if (!ban) {
				let banNum = client.banLimit.get(message.author.id) || 0;
				client.banLimit.set(message.author.id, banNum + 1);
				if (banNum == 5)
					return client.send(
						"Gün içerisinde çok fazla ban işlemi uyguladığınız için komut geçici olarak kullanımınıza kapatılmıştır.",
						message.author,
						message.channel,
					);
				await message.guild.members.ban(user.id, {
					reason: `${reason} | Yetkili: ${message.author.username}`,
				});
				await message.channel.send({ embeds: [embed] });
				const banEmbed = new Discord.EmbedBuilder()
					.setAuthor({
						name: message.author.username,
						iconURL: message.author.displayAvatarURL({
							dynamic: true,
						}),
					})
					.setColor("Random")
					.setDescription(
						"**" +
							user.username +
							" - (" +
							user.id +
							")** adlı kullanıcını sunucumuzdan yasaklanmıştır.\n\n```Yasaklanma sebebi: " +
							reason +
							"\nYasaklayan yetkili: " +
							message.author.username +
							"\nYasaklanma başlangıç tarihi: " +
							moment(Date.parse(new Date())).format("LLL") +
							"```",
					);
				await client.channels.cache
					.get(server.BanLog)
					.send({ embeds: [banEmbed] });
				await data
					.find({})
					.sort({ ihlal: "descending" })
					.exec(async (err, res) => {
						const newData = new data({
							user: user.id,
							yetkili: message.author.id,
							ihlal: id + 1,
							ceza: "Yasaklı",
							sebep: reason,
							tarih: moment(Date.parse(new Date())).format("LLL"),
							bitiş: "-",
						});
						await newData.save().catch((e) => console.error(e));
					});
			}
		});
	},
};
