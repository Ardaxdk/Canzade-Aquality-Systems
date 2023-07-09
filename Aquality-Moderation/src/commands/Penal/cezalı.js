const Discord = require("discord.js");
const cezalar = require("../../models/cezalı.js");
const ceza = require("../../models/cezalar.js");
const mutes = require("../../models/chatmute.js");
const ms = require("ms");
const moment = require("moment");
let serverSettings = require("../../models/serverSettings");
require("moment-duration-format");
const sunucu = require("../../models/sunucu-bilgi");
module.exports = {
	conf: {
		name: "cezalı",
		usage: "jail [@user] [sebep]",
		category: "Authorized",
		description: "Belirttiğiniz kişiyi cezalıya atarsınız.",
		aliases: ["jail", "slave"],
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
			message.mentions.users.first() ||
			(await client.users.fetch(args[0]).catch((e) => console.log(e)));
		if (!user)
			return client.send(
				"Cezalıya atmak istediğin kullanıcı geçerli değil.",
				message.author,
				message.channel,
			);
		if (user.bot)
			return client.send(
				"Botlara işlem uygulayamazsın.",
				message.author,
				message.channel,
			);
		if (message.guild.members.cache.has(user.id)) {
			let member = message.guild.members.cache.get(user.id);
			if (server.BotCommandRole.some((x) => member.roles.cache.has(x)))
				return client.send(
					"Yetkililer birbirlerine ceza işlemi uygulayamazlar.",
					message.author,
					message.channel,
				);
			if (
				message.guild.members.cache
					.get(user.id)
					.permissions.has(
						Discord.PermissionsBitField.Flags.ManageRoles,
					)
			)
				return client.send(
					"Üst yetkiye sahip kişileri yasaklayamazsın!",
					message.author,
					message.channel,
				);
			if (
				message.member.roles.highest.position <=
				message.guild.members.cache.get(user.id).roles.highest.position
			)
				return client.send(
					"Kendi rolünden yüksek kişilere işlem uygulayamazsın!",
					message.author,
					message.channel,
				);
		}
		if (user.id == message.author.id)
			return client.send(
				"Kullanıcılar kendilerine ceza-i işlem uygulayamaz.",
				message.author,
				message.channel,
			);
		let id = await ceza.countDocuments().exec();
		let banNum = client.jailLimit.get(message.author.id) || 0;
		client.jailLimit.set(message.author.id, banNum + 1);
		if (banNum == 5)
			return client.send(
				"Gün içerisinde çok fazla jail işlemi uyguladığınız için komut geçici olarak kullanımınıza kapatılmıştır.",
				message.author,
				message.channel,
			);

		const embed = new Discord.EmbedBuilder().setColor("Random").setAuthor({
			name: message.author.username,
			iconURL: message.author.displayAvatarURL({ dynamic: true }),
		}).setDescription(`
**${user} Kişisinin cezasını, belirtilen butona tıklayarak seçiniz.**
\`Eğer sebep aşağıda bulunmuyorsa bu slave işlemine uygun değildir! \`
`);

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.StringSelectMenuBuilder()
				.setCustomId("chatmuteceza")
				.setPlaceholder("Kullanıcının ceza türünü seçmek için tıkla!")
				.addOptions([
					{
						emoji: "1️⃣",
						label: `Sunucunun düzenini bozacak hal ve davranış`,
						value: "1",
					},
					{
						emoji: "2️⃣",
						label: `Din / ırkçılık / siyaset`,
						value: "2",
					},
					{
						emoji: "3️⃣",
						label: `Tehdit / Şantaj / İftira atmak / Kandırmak`,
						value: "3",
					},
					{
						emoji: "4️⃣",
						label: `Uyarılara rağmen küfür ve trol`,
						value: "4",
					},
					{
						emoji: "5️⃣",
						label: `Reklam`,
						value: "5",
					},
					{
						emoji: "6️⃣",
						label: `Taciz`,
						value: "6",
					},
					{
						emoji: "❎",
						label: `iptal`,
						value: "iptal",
					},
				]),
		);

		var msg = await message.reply({
			embeds: [embed],
			components: [row],
		});
		var filter = (button) => button.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 30000,
		});

		collector.on("collect", async (button) => {
			if (button.values[0] === "1") {
				button.deferUpdate();
				await Cezalıver(
					user,
					"Sunucunun düzenini bozacak hal ve davranış",
					1000 * 60 * 60 * 24 * 1,
				);
			} else if (button.values[0] === "2") {
				button.deferUpdate();
				await Cezalıver(user, "Din / ırkçılık / siyaset");
			} else if (button.values[0] === "3") {
				button.deferUpdate();
				await Cezalıver(
					user,
					"Tehdit / Şantaj / İftira atmak / Kandırmak",
					1000 * 60 * 60 * 24 * 2,
				);
			} else if (button.values[0] === "4") {
				button.deferUpdate();
				await Cezalıver(
					user,
					"Uyarılara rağmen küfür ve trol",
					1000 * 60 * 60 * 24 * 2,
				);
			} else if (button.values[0] === "5") {
				button.deferUpdate();
				await Cezalıver(user, "Reklam", 1000 * 60 * 60 * 24 * 7);
			} else if (button.values[0] === "6") {
				button.deferUpdate();
				await Cezalıver(user, "Taciz", 1000 * 60 * 60 * 24 * 7);
			} else if (button.values[0] === "iptal") {
				button.deferUpdate();
				button.reply({ content: "İşlem iptal edildi." });
			}
		});

		async function Cezalıver(user, sebep, sure) {
			/*	const za = new Discord.EmbedBuilder()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL({ dynamic: true }),
				})
				.setColor("Random").setDescription(`
${user} \`${sebep}\` sebebiyle cezalı veritabanına kayıt edildi.
Ceza bitiş tarihi: ${moment(Date.parse(new Date()) + sure).format("LLL")}.
`);

			msg.edit({ embeds: [za], components: [] });*/

			if (!message.guild.members.cache.has(user.id)) {
				await cezalar.findOne({ user: user.id }, async (err, doc) => {
					if (doc)
						return msg.edit({
							embeds: [
								new Discord.EmbedBuilder()
									.setAuthor({
										name: message.author.username,
										iconURL:
											message.author.displayAvatarURL({
												dynamic: true,
											}),
									})
									.setColor("Random")
									.setDescription(
										`${user.username} üyesi veritabanında cezalı olarak bulunuyor.`,
									),
							],
							components: [],
						});
					if (!doc) {
						const embedx = new Discord.EmbedBuilder()
							.setAuthor({
								name: message.author.username,
								iconURL: message.author.displayAvatarURL({
									dynamic: true,
								}),
							})
							.setColor("Random")
							.setDescription(
								`${
									user.username
								} üyesi sunucuda olmamasına rağmen cezalıya atıldı. (Ceza Numarası: \`#${
									id + 1
								}\`)`,
							);
						msg.edit({ embeds: [embedx], components: [] });

						const newPun = new cezalar({
							user: user.id,
							ceza: true,
							yetkili: message.author.id,
							tarih: moment(Date.now()).format("LLL"),
							bitis: Date.now() + sure,
							sebep: sebep,
						});
						await newPun.save().catch((e) => console.log(e));
					}
					await ceza
						.find({})
						.sort({ ihlal: "descending" })
						.exec(async (err, res) => {
							const newData = new ceza({
								user: user.id,
								yetkili: message.author.id,
								ihlal: id + 1,
								ceza: "Cezalı",
								sebep: sebep,
								tarih: moment(Date.now()).format("LLL"),
								bitiş: moment(Date.now() + sure).format("LLL"),
							});
							await newData.save().catch((e) => console.error(e));
						});
				});
			} else {
				await cezalar.findOne({ user: user.id }, async (err, doc) => {
					if (doc)
						return msg.edit({
							embeds: [
								new Discord.EmbedBuilder()
									.setAuthor({
										name: message.author.username,
										iconURL:
											message.author.displayAvatarURL({
												dynamic: true,
											}),
									})
									.setColor("Random")
									.setDescription(
										`${user.username} üyesi veritabanında cezalı olarak bulunuyor.`,
									),
							],
							components: [],
						});
					let member = message.guild.members.cache.get(user.id);
					let memberRoles = member.roles.cache.map((x) => x.id);
					member.roles
						.set(
							member.roles.cache.has(server.BoosterRole)
								? (server.BoosterRole, server.QuarantineRole)
								: server.QuarantineRole,
						)
						.catch((e) => console.log(e));
					client.PunishPointControl(member);
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setAuthor({
									name: message.author.username,
									iconURL: message.author.displayAvatarURL({
										dynamic: true,
									}),
								})
								.setColor("Random").setDescription(`
${user} \`${sebep}\` sebebiyle cezalı veritabanına kayıt edildi.
Ceza bitiş tarihi: ${moment(Date.now() + sure).format("LLL")}.
`),
						],
						components: [],
					});
					const zaaaa = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setColor("Random")
						.setFooter({
							text: `Ceza Numarası: #${id + 1}`,
						}).setDescription(`
${user} (\`${user.username}\` - \`${
						user.id
					}\`) kişisine **${sebep}** sebebiyle <@&${
						server.QuarantineRole
					}> rolü verildi.
        
• Jail atılma tarihi: ${moment(Date.now()).format("LLL")}
• Jail sebebi: ${sebep}
        `);
					await client.channels.cache
						.get(server.JailLog)
						.send({ embeds: [zaaaa] });
					await client.channels.cache
						.get(server.PenaltyPointLog)
						.send({
							content: `${user} Kişisinin Ceza Puanı Güncellendi, Yeni Puanı: ${
								(await client.punishPoint(user.id)) + 15
							}`,
						})
						.catch((e) => {});
					if (!doc) {
						const newPun = new cezalar({
							user: user.id,
							ceza: true,
							roller: memberRoles,
							yetkili: message.author.id,
							tarih: moment(Date.now()).format("LLL"),
							bitis: Date.now() + sure,
							sebep: sebep,
						});
						await newPun.save().catch((e) => console.log(e));
					}
					await ceza
						.find({})
						.sort({ ihlal: "descending" })
						.exec(async (err, res) => {
							const newData = new ceza({
								user: user.id,
								yetkili: message.author.id,
								ihlal: id + 1,
								ceza: "Cezalı",
								sebep: sebep,
								tarih: moment(Date.now()).format("LLL"),
								bitiş: moment(Date.now() + sure).format("LLL"),
							});
							await newData.save().catch((e) => console.error(e));
						});
				});
			}
		}
	},
};
