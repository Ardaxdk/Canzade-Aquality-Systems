const moment = require("moment");
const data = require("../models/cezalar.js");
const mutes = require("../models/chatmute.js");
const ms = require("ms");
const Discord = require("discord.js");
let serverSettings = require("../models/serverSettings");
moment.locale("tr");

module.exports = async (oldMessage, newMessage) => {
	if (newMessage.author.bot && newMessage.author.id !== client.user.id)
		return;
	let server = await serverSettings.findOne({});
	const content = newMessage.content.toLocaleLowerCase().trim();
	const inviteRegex =
		/(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;
	const emojiRegex =
		/<a?:.+?:\d+>|[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
	const mentionRegex = /<@!?&?\d+>/g;
	const urlRegex =
		/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
	let id = await data.countDocuments().exec();
	let embed = new Discord.EmbedBuilder()
		.setAuthor({
			name: newMessage.author.username,
			iconURL: newMessage.author.displayAvatarURL({ dynamic: true }),
		})
		.setColor("Aqua")
		.setTimestamp();

	if (
		!newMessage.member.permissions.has(
			Discord.PermissionsBitField.Flags.ManageRoles,
		)
	) {
		if (newMessage.content.length >= 9) {
			let contentCaps = newMessage.content.replace(/[^A-Z]/g, "").length;
			let messagePercentage = client.yuzde(
				contentCaps,
				newMessage.content.length,
			);
			if (Math.round(messagePercentage) > 60) {
				let warnCount = client.capsBlock.get(newMessage.author.id) || 0;
				client.capsBlock.set(newMessage.author.id, warnCount + 1);
				if (warnCount >= 4) {
					if (newMessage.deletable) await newMessage.delete();
					await newMessage.member.roles.add(server.ChatMuteRole);
					await mutes.findOne(
						{ user: newMessage.author.id },
						async (err, doc) => {
							const newMute = new mutes({
								user: newMessage.author.id,
								muted: true,
								yetkili: client.user.id,
								endDate: Date.now() + 1000 * 60 * 5,
								start: Date.now(),
								sebep: "Abartı Caps Lock kullanımı.",
							});
							await newMute.save().catch((e) => console.log(e));
						},
					);
					await data
						.find({})
						.sort({ ihlal: "descending" })
						.exec(async (err, res) => {
							const newData = new data({
								user: newMessage.author.id,
								yetkili: client.user.id,
								ihlal: id + 1,
								ceza: "Chat Mute",
								sebep: "Abartı Caps Lock kullanımı.",
								tarih: moment(Date.parse(new Date())).format(
									"LLL",
								),
								bitiş: moment(
									Date.parse(new Date()) + 1000 * 60 * 5,
								).format("LLL"),
							});
							await newData.save().catch((e) => console.error(e));
						});
					newMessage.channel.send({
						embeds: [
							embed.setDescription(
								`${newMessage.author}, uyarılarınızdan dolayı susturuldunuz. Lütfen caps lock kullanımını azaltın.`,
							),
						],
					});
				} else {
					let totalWarnCount = 4 - warnCount;

					if (newMessage.deletable) newMessage.delete();
					newMessage.channel.send({
						embeds: [
							embed.setDescription(
								`${newMessage.author} Büyük harf kullanımını azaltın. (> %60)\nKalan uyarı hakkınız: **${totalWarnCount}**`,
							),
						],
					});
				}
				setTimeout(() => {
					client.capsBlock.delete(newMessage.author.id);
				}, ms("30s"));
			}
		}
	}
	if (
		!newMessage.member.permissions.has(
			Discord.PermissionsBitField.Flags.ManageRoles,
		)
	) {
		if (inviteRegex.test(content)) {
			const invites = await newMessage.guild.invites.fetch();
			if (
				(newMessage.guild.vanityURLCode &&
					newMessage.content
						.match(inviteRegex)
						.some((i) => i === newMessage.guild.vanityURLCode)) ||
				invites.some((x) =>
					newMessage.content.match(inviteRegex).some((i) => i === x),
				)
			)
				return;
			let warnCount = client.adBlock.get(newMessage.author.id) || 0;
			client.adBlock.set(newMessage.author.id, warnCount + 1);
			if (warnCount >= 4) {
				newMessage.member.ban();
				if (newMessage.deletable) newMessage.delete();

				newMessage.channel.send({
					embeds: [
						embed.setDescription(
							`${newMessage.author}, 4. kez reklam yaptığınız için sunucudan banlandınız.`,
						),
					],
				});
			} else if (warnCount >= 3) {
				newMessage.member.kick();
				if (newMessage.deletable) newMessage.delete();
				newMessage.channel.send({
					embeds: [
						embed.setDescription(
							`${newMessage.author}, 3. kez reklam yaptığınız için sunucudan kicklendiniz, bir daha ki sefere ban yiyeceksiniz.`,
						),
					],
				});
			} else {
				let totalWarnCount = 4 - warnCount;
				if (newMessage.deletable) newMessage.delete();
				newMessage.channel.send({
					embeds: [
						embed.setDescription(
							`${newMessage.author} Lütfen reklam yapmayınız devam ederseniz sunucudan atılacaksınız. Kalan uyarı hakkınız: **${totalWarnCount}**`,
						),
					],
				});
			}
			setTimeout(() => {
				client.adBlock.delete(newMessage.author.id);
			}, ms("30s"));
		}

		/*	if (
			!newMessage.member.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			)
		) {
			if (urlRegex.test(content)) {
				if (newMessage.deletable) newMessage.delete();

				newMessage.channel.send({
					embeds: [
						embed
							.setDescription(
								`${newMessage.author}, bu sunucuda link paylaşımı yapamazsınız`,
							)
					],
				});
			}
		}*/

		if (
			!newMessage.member.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			)
		) {
			if (
				emojiRegex.test(content) &&
				newMessage.content.match(emojiRegex).length > 3
			) {
				if (newMessage.deletable) newMessage.delete();

				newMessage.channel.send({
					embeds: [
						embed.setDescription(
							`${newMessage.author}, lütfen emoji kullanımını azaltın.`,
						),
					],
				});
			}
		}
	}

	if (
		!newMessage.member.permissions.has(
			Discord.PermissionsBitField.Flags.ManageRoles,
		)
	) {
		if (
			mentionRegex.test(content) &&
			newMessage.content.match(mentionRegex).length >= 5
		) {
			if (newMessage.deletable) newMessage.delete();
			await newMessage.member.roles.add(server.ChatMuteRole);
			await mutes.findOne(
				{ user: newMessage.author.id },
				async (err, doc) => {
					const newMute = new mutes({
						user: newMessage.author.id,
						muted: true,
						yetkili: client.user.id,
						endDate: Date.now() + 1000 * 60 * 3,
						start: Date.now(),
						sebep: "Abartı etiket kullanımı.",
					});
					await newMute.save().catch((e) => console.log(e));
				},
			);
			await data
				.find({})
				.sort({ ihlal: "descending" })
				.exec(async (err, res) => {
					const newData = new data({
						user: newMessage.author.id,
						yetkili: client.user.id,
						ihlal: id + 1,
						ceza: "Chat Mute",
						sebep: "Abartı etiket kullanımı.",
						tarih: moment(Date.parse(new Date())).format("LLL"),
						bitiş: moment(
							Date.parse(new Date()) + 1000 * 60 * 3,
						).format("LLL"),
					});
					await newData.save().catch((e) => console.error(e));
				});

			newMessage.channel.send({
				embeds: [
					embed.setDescription(
						`${newMessage.author}, çok fazla etiket attığın için 3 dakika susturuldun.`,
					),
				],
			});
		}
	}

	client.channels.cache
		.find((channel) => channel.name === "message-update")
		.send({
			embeds: [
				embed
					.setThumbnail(
						newMessage.author.displayAvatarURL({ dynamic: true }),
					)
					.setDescription(
						`
    ${newMessage.author} <#${
							newMessage.channel.id
						}> kanalında bir mesaj güncelledi.
\`\`\`
    Eski Mesaj: ${oldMessage.content} 
Yeni Mesaj: ${newMessage.content}
Kanal: ${newMessage.channel.name} - (${newMessage.channel.id})
Kullanıcı: ${newMessage.author.username} - (${newMessage.author.id})
Mesaj ID: ${newMessage.id}
Mesaj Tarihi: ${moment(Date.parse(new Date())).format("LLL")}
\`\`\``,
					),
			],
		});
};

module.exports.conf = {
	name: "messageUpdate",
};
