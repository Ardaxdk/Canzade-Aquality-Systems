const data = require("../../models/cezalar.js");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const Discord = require("discord.js");
const mutes = require("../../models/chatmute.js");
const sunucu = require("../../models/sunucu-bilgi.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "mute",
		usage: "mute [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişiye chat mute atarsınız.",
		aliases: ["mute", "cmute", "chatmute", "chat-mute"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.ChatMuteAuth.includes(r.id),
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
				"Susturmak istediğin kullanıcıyı bulamadım.",
				message.author,
				message.channel,
			);
		if (user.id == message.author.id)
			return client.send(
				"Kullanıcılar kendilerine ceza-i işlem uygulayamaz.",
				message.author,
				message.channel,
			);
		if (server.ChatMuteRole.some((x) => user.roles.cache.has(x)))
			return client.send(
				"Kullanıcı zaten susturulmuş durumda.",
				message.author,
				message.channel,
			);
		if (!message.member.roles.cache.get(server.GuildOwner)) {
			if (
				user.permissions.has(
					Discord.PermissionsBitField.Flags.ManageRoles,
				)
			)
				return client.send(
					"Yöneticilere ceza-i işlem uygulayamazsın.",
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
			if (user.roles.cache.has(server.GuildOwner))
				return client.send(
					"Yetkililer birbirlerine ceza işlemi uygulayamazlar.",
					message.author,
					message.channel,
				);
		}

		let id = await data.countDocuments().exec();

		/*if (args[1] === "adk".toLocaleLowerCase()) {
			await Muteceza(user, "Ailevi küfür", 1000 * 60 * 20);
		} else if (
			args[1] === "flood".toLocaleLowerCase() ||
			args[1] === "spam".toLocaleLowerCase()
		) {
			await Muteceza(user, "Flood, Spam", 1000 * 60 * 10);
		} else if (args[1] === "küfür".toLocaleLowerCase()) {
			await Muteceza(
				user,
				"Küfür, Ortam bozma, Troll, Soundpad",
				1000 * 60 * 10,
			);
		} else if (args[1] === "siyaset".toLocaleLowerCase()) {
			await Muteceza(user, "Siyaset", 1000 * 60 * 20);
		} else if (args[1] === "taciz".toLocaleLowerCase()) {
			await Muteceza(
				user,
				"Taciz, Kadın üyelere sarkmak",
				1000 * 60 * 60 * 1,
			);
		} else if (args[1] === "kışkırtma".toLocaleLowerCase()) {
			await Muteceza(
				user,
				"Tartışmak, kavga etmek veya rahatsızlık çıkarmak, kışkırtmak",
				1000 * 60 * 15,
			);
		} else {*/
		const embed = new Discord.EmbedBuilder().setColor("Random").setAuthor({
			name: message.author.username,
			iconURL: message.author.displayAvatarURL({ dynamic: true }),
		}).setDescription(`
**${user} Kişisinin mute sebebini belirtilen butona tıklayarak seçiniz.**
`);
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.StringSelectMenuBuilder()
				.setCustomId("chatmuteceza")
				.setPlaceholder("Kullanıcının ceza türünü seçmek için tıkla!")
				.addOptions([
					{
						emoji: "1️⃣",
						label: `Sesteki olayı chat'e yansıtmak / konuyu uzatmak`,
						value: "1",
					},
					{
						emoji: "2️⃣",
						label: `Küfür, Ortam bozma, Troll, Soundpad`,
						value: "2",
					},
					{
						emoji: "3️⃣",
						label: `Flood, Spam`,
						value: "3",
					},
					{
						emoji: "4️⃣",
						label: `Dizi veya filmler hakkında spoiler vermek`,
						value: "4",
					},
					{
						emoji: "5️⃣",
						label: `Tartışmak, kavga etmek veya rahatsızlık çıkarmak, kışkırtmak`,
						value: "5",
					},
					{
						emoji: "6️⃣",
						label: `Ailevi küfür`,
						value: "6",
					},
					{
						emoji: "7️⃣",
						label: `Siyaset`,
						value: "7",
					},
					{
						emoji: "8️⃣",
						label: `Ortamı (${message.guild.name}) kötülemek`,
						value: "8",
					},
					{
						emoji: "9️⃣",
						label: `Taciz, Kadın üyelere sarkmak`,
						value: "9",
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
				await Muteceza(
					user,
					"Sesteki olayı chat'e yansıtmak / konuyu uzatmak",
					1000 * 60 * 5,
				);
			} else if (button.values[0] === "2") {
				button.deferUpdate();

				await Muteceza(
					user,
					"Küfür, Ortam bozma, Troll, Soundpad",
					1000 * 60 * 10,
				);
			} else if (button.values[0] === "3") {
				button.deferUpdate();

				await Muteceza(user, "Flood, Spam", 1000 * 60 * 10);
			} else if (button.values[0] === "4") {
				button.deferUpdate();

				await Muteceza(
					user,
					"Dizi veya filmler hakkında spoiler vermek",
					1000 * 60 * 10,
				);
			} else if (button.values[0] === "5") {
				button.deferUpdate();

				await Muteceza(
					user,
					"Tartışmak, kavga etmek veya rahatsızlık çıkarmak, kışkırtmak",
					1000 * 60 * 15,
				);
			} else if (button.values[0] === "6") {
				button.deferUpdate();

				await Muteceza(user, "Ailevi küfür", 1000 * 60 * 20);
			} else if (button.values[0] === "7") {
				button.deferUpdate();

				await Muteceza(user, "Siyaset", 1000 * 60 * 20);
			} else if (button.values[0] === "8") {
				button.deferUpdate();

				await Muteceza(
					user,
					`Ortamı (${message.guild.name}) kötülemek`,
					1000 * 60 * 30,
				);
			} else if (button.values[0] === "9") {
				button.deferUpdate();

				await Muteceza(
					user,
					"Taciz, Kadın üyelere sarkmak",
					1000 * 60 * 60 * 1,
				);
			} else if (button.values[0] === "iptal") {
				button.deferUpdate();

				const embed = new Discord.EmbedBuilder()
					.setColor("Random")
					.setAuthor({
						name: message.author.username,
						iconURL: message.author.displayAvatarURL({
							dynamic: true,
						}),
					})
					.setDescription(`işlem iptal edildi.`);

				msg.edit({ embeds: [embed], components: [] });
			}
		});
		collector.on("end", async (button) => {
			const embed = new Discord.EmbedBuilder()
				.setColor("Random")
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL({
						dynamic: true,
					}),
				})
				.setDescription(
					`30 Saniye içerisinde seçim yapılmadığı için işlem iptal edildi.`,
				);

			msg.edit({ embeds: [embed], components: [] });
		});
		async function Muteceza(user, sebep, time) {
			//   let dataTime = await client.extraMute(user.id, "chatMute", time).then(res => res.ihlal)
			let şuanki = Date.parse(new Date());
			let cıkaralım = time + Date.parse(new Date());

			user.roles.add(server.ChatMuteRole);
			client.PunishPointControl(user);
			await msg.edit({
				content: `${client.emojis.cache.find(
					(x) => x.name === client.settings.emojis.yes_name,
				)} <@${
					user.id
				}> kişisi **${sebep}.** sebebiyle metin kanallarında **${await client.turkishDate(
					time,
				)}** susturuldu. (Ceza Numarası: \`#${id + 1}\`)`,
				embeds: [],
				components: [],
			});

			const mutelendi = new Discord.EmbedBuilder()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL({
						dynamic: true,
					}),
				})
				.setColor("Random")
				.setFooter({ text: `Ceza Numarası: #${id + 1}` })
				.setDescription(`
${user} (\`${user.user.username}\` - \`${
				user.id
			}\`) kişisi ${await client.turkishDate(
				time,
			)} boyunca metin kanallarında susturuldu
• Chat Mute atılma tarihi: <t:${Math.floor(şuanki / 1000)}> 
• Chat Mute bitiş tarihi: <t:${Math.floor(cıkaralım / 1000)}> (<t:${Math.floor(
				cıkaralım / 1000,
			)}:R>)
• Chat Mute sebebi: ${sebep}
`);
			await client.channels.cache
				.get(server.ChatMuteLog)
				.send({ embeds: [mutelendi] });
			await client.channels.cache
				.get(server.PenaltyPointLog)
				.send({
					content: `${user} Kişisinin Ceza Puanı Güncellendi, Yeni Puanı: ${
						(await client.punishPoint(user.id)) + 8
					}`,
				})
				.catch((e) => {});
			await mutes.findOne({ user: user.id }, async (err, doc) => {
				const newMute = new mutes({
					user: user.id,
					muted: true,
					yetkili: message.author.id,
					endDate: Date.now() + time,
					start: Date.now(),
					sebep: sebep,
				});
				await newMute.save().catch((e) => console.log(e));
			});
			await data
				.find({})
				.sort({ ihlal: "descending" })
				.exec(async (err, res) => {
					const newData = new data({
						user: user.id,
						yetkili: message.author.id,
						ihlal: id + 1,
						ceza: "Chat Mute",
						sebep: sebep,
						tarih: moment(Date.parse(new Date())).format("LLL"),
						bitiş: moment(Date.parse(new Date()) + time).format(
							"LLL",
						),
					});
					await newData.save().catch((e) => console.error(e));
				});
		}
	},
};
