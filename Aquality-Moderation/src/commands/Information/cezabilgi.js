const data = require("../../models/cezalar.js");
const ms = require("ms");
const mutes = require("../../models/chatmute.js");
const vmutes = require("../../models/voicemute.js");
const cezalar = require("../../models/cezalı.js");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const Discord = require("discord.js");
module.exports = {
	conf: {
		name: "info",
		usage: "info [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişinin aktif cezalarını görürsünüz.",
		aliases: ["cezainfo", "ceza-bilgi", "ceza-info", "bilgi-ceza"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.JailAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let user =
			message.mentions.members.first() ||
			(await client.üye(args.join(" "), message.guild)) ||
			(await client.client_üye(args.join(" ")));
		if (!user)
			return client.send(
				"Ceza bilgisine bakmak istediğin kullanıcıyı bulamadım.",
				message.author,
				message.channel,
			);
		if (!message.guild.members.cache.has(user.id))
			return client.send(
				"Ceza bilgisine bakmak istediğin kullanıcı sunucuda bulunmuyor.",
				message.author,
				message.channel,
			);
		let mute = "";
		let vmute = "";
		let cezalı = "";
		await cezalar.findOne({ user: user.id }, async (err, doc) => {
			if (!doc) {
				cezalı = "Veritabanında cezalı bilgisi bulunmamakta.";
			} else {
				if (doc.ceza == false) {
					cezalı = "Veritabanında cezalı bilgisi bulunmamakta.";
				} else if (doc.ceza == true) {
					cezalı =
						"Cezalı Atan Yetkili: <@" +
						client.users.cache.get(doc.yetkili) +
						">\nCeza Sebebi: `" +
						doc.sebep +
						"`\nCeza Tarihi: `" +
						doc.tarih +
						"`\nCeza Bitiş: `" +
						moment(doc.bitis).format("LLL") +
						"`";
				}
			}
		});
		await mutes.findOne({ user: user.id }, async (err, doc) => {
			if (!doc) {
				mute = "Veritabanında chat mute bilgisi bulunmamakta.";
			} else {
				if (doc.muted == false) {
					mute = "Veritabanında chat mute bilgisi bulunmamakta.";
				} else if (doc.muted == true) {
					mute =
						"Mute Atan Yetkili: <@" +
						client.users.cache.get(doc.yetkili) +
						">\nMute Sebebi: `" +
						doc.sebep +
						"`\nMute Başlangıç: `" +
						moment(doc.start).format("LLL") +
						"`\nMute Bitiş: `" +
						moment(doc.endDate).format("LLL") +
						"`";
				}
			}
		});
		await vmutes.findOne({ user: user.id }, async (err, doc) => {
			if (!doc) {
				vmute = "Veritabanında ses mute bilgisi bulunmamakta.";
			} else {
				if (doc.muted == false) {
					vmute = "Veritabanında ses mute bilgisi bulunmamakta.";
				} else if (doc.muted == true) {
					vmute =
						"Mute Atan Yetkili: <@" +
						client.users.cache.get(doc.yetkili) +
						">\nMute Sebebi: `" +
						doc.sebep +
						"`\nMute Başlangıç: `" +
						moment(doc.start).format("LLL") +
						"`\nMute Bitiş: `" +
						moment(doc.endDate).format("LLL") +
						"`";
				}
			}
		});
		let uu = client.users.cache.get(user.id);
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Random")
			.setDescription(
				"<@" +
					user.id +
					"> kişisinin ceza bilgileri aşağıda belirtilmiştir.",
			)
			.setThumbnail(uu.displayAvatarURL({ dynamic: true }))
			.addFields([
				{
					name: "Cezalı Bilgisi",
					value:
						cezalı ||
						"Veritabanında aktif cezalı bilgisi bulunmamakta.",
				},
				{
					name: "Chat Mute Bilgisi:",
					value:
						mute ||
						"Veritabanında aktif chat mute bilgisi bulunmamakta.",
				},
				{
					name: "Ses Mute Bilgisi:",
					value:
						vmute ||
						"Veritabanında aktif voice mute bilgisi bulunmamakta.",
				},
			]);
		await message.channel.send({ embeds: [embed] });
	},
};
