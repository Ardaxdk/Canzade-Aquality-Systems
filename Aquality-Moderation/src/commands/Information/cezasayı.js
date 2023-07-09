const data = require("../../models/cezalar.js");
const notlar = require("../../models/notlar.js");
const ms = require("ms");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const Discord = require("discord.js");
const { table } = require("table");
module.exports = {
	conf: {
		name: "ceza-sayı",
		usage: "cezasayı [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişinin ceza sayısını görürsünüz.",
		aliases: [
			"cezasayı",
			"cezasayi",
			"ceza-sayi",
			"cs",
			"ceza-sayı",
			"cezapuan",
			"ceza-puan",
		],
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
			(await client.üye(args[0], message.guild));
		if (!user)
			return client.send(
				"Ceza sayılarına bakmak istediğin kullanıcyı belirtmelisin",
				message.author,
				message.channel,
			);
		await data
			.find({ user: user.id })
			.sort({ ihlal: "descending" })
			.exec(async (err, res) => {
				let filterArr = [];
				res.map((x) => filterArr.push(x.ceza));
				await notlar.findOne({ user: user.id }, async (err, data) => {
					let chatMute =
						filterArr.filter((x) => x == "Chat Mute").length || 0;
					let voiceMute =
						filterArr.filter((x) => x == "Voice Mute").length || 0;
					let jail =
						filterArr.filter((x) => x == "Cezalı").length || 0;
					let puan = await client.punishPoint(user.id);
					let cezasayı = await client.cezasayı(user.id);
					let uyarı;
					if (!data) uyarı = 0;
					if (data) uyarı = data.notlar.length;

					let durum;
					if (cezasayı < 5) durum = "Çok Güvenli";
					if (cezasayı >= 5 && cezasayı < 10) durum = "Güvenli";
					if (cezasayı >= 10 && cezasayı < 15) durum = "Şüpheli";
					if (cezasayı >= 15 && cezasayı < 20) durum = "Tehlikeli";
					if (cezasayı >= 20) durum = "Çok Tehlikeli";

					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: user.user.username,
							iconURL: user.user.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setDescription(
							"🚫 <@" +
								user.id +
								"> kişisinin sahip olduğu ceza sayıları aşağıda belirtilmiştir\n\n**" +
								chatMute +
								"** Chat Mute, **" +
								voiceMute +
								"** Voice Mute, **" +
								jail +
								"** Cezalı ve **" +
								uyarı +
								"** Uyarı notu." +
								"\n\n__Ceza Puanı__ : " +
								puan,
						)

						.setColor("Random");
					message.channel.send({ embeds: [embed] });
				});
			});
	},
};
