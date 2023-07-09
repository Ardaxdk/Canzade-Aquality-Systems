const moment = require("moment");
const data = require("../models/cezalar.js");
const mutes = require("../models/chatmute.js");
const ms = require("ms");
const Discord = require("discord.js");
let serverSettings = require("../models/serverSettings");
moment.locale("tr");
module.exports = async (message) => {
	if (message.author.bot && message.author.id !== client.user.id) return;
	let server = await serverSettings.findOne({});
	await client.spamMessage(message);
	const content = message.content.toLocaleLowerCase().trim();
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
			name: message.author.username,
			iconURL: message.author.displayAvatarURL({ dynamic: true }),
		})
		.setColor("Aqua")
		.setTimestamp();

	if (
		!message.member.permissions.has(
			Discord.PermissionsBitField.Flags.ManageRoles,
		)
	) {
		if (message.content.length >= 9) {
			let contentCaps = message.content.replace(/[^A-Z]/g, "").length;
			let messagePercentage = client.yuzde(
				contentCaps,
				message.content.length,
			);
			if (Math.round(messagePercentage) > 60) {
				let warnCount = client.capsBlock.get(message.author.id) || 0;
				client.capsBlock.set(message.author.id, warnCount + 1);
				if (warnCount >= 4) {
					if (message.deletable) message.delete();
					await message.member.roles.add(server.ChatMuteRole);
					await mutes.findOne(
						{ user: message.author.id },
						async (err, doc) => {
							const newMute = new mutes({
								user: message.author.id,
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
								user: message.author.id,
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

					message.channel.send({
						embeds: [
							embed.setDescription(
								`${message.author}, uyarılarınızdan dolayı susturuldunuz. Lütfen caps lock kullanımını azaltın.`,
							),
						],
					});
				} else {
					let totalWarnCount = 4 - warnCount;

					if (message.deletable) message.delete();
					message.channel.send({
						embeds: [
							embed.setDescription(
								`${message.author} büyük harf kullanımını azaltın. (> %60)\nKalan uyarı hakkınız: **${totalWarnCount}**`,
							),
						],
					});
				}
				setTimeout(() => {
					client.capsBlock.delete(message.author.id);
				}, ms("30s"));
			}
		}
	}
	if (
		!message.member.permissions.has(
			Discord.PermissionsBitField.Flags.ManageRoles,
		)
	) {
		if (inviteRegex.test(content)) {
			const invites = await message.guild.invites.fetch();
			if (
				(message.guild.vanityURLCode &&
					message.content
						.match(inviteRegex)
						.some((i) => i === message.guild.vanityURLCode)) ||
				invites.some((x) =>
					message.content.match(inviteRegex).some((i) => i === x),
				)
			)
				if (
					(message.guild.vanityURLCode &&
						message.content
							.match(inviteRegex)
							.some((i) => i === message.guild.vanityURLCode)) ||
					invites.some((x) =>
						message.content.match(inviteRegex).some((i) => i === x),
					)
				)
					return;
			let warnCount = client.adBlock.get(message.author.id) || 0;
			client.adBlock.set(message.author.id, warnCount + 1);
			if (warnCount >= 4) {
				message.member.ban();
				if (message.deletable) message.delete();
				message.channel.send({
					embeds: [
						embed.setDescription(
							`${message.author}, 4. kez reklam yaptığınız için sunucudan banlandınız.`,
						),
					],
				});
			} else if (warnCount >= 3) {
				message.member.kick();
				if (message.deletable) message.delete();
				message.channel.send({
					embeds: [
						embed.setDescription(
							`${message.author}, 3. kez reklam yaptığınız için sunucudan kicklendiniz, bir daha ki sefere ban yiyeceksiniz.`,
						),
					],
				});
			} else {
				let totalWarnCount = 4 - warnCount;
				if (message.deletable) message.delete();
				message.channel.send({
					embeds: [
						embed.setDescription(`${message.author}
								Lütfen reklam yapmayınız devam ederseniz sunucudan atılacaksınız. Kalan uyarı hakkınız: **${totalWarnCount}**`),
					],
				});
			}
			setTimeout(() => {
				client.adBlock.delete(message.author.id);
			}, ms("30s"));
		}
		/*	if (
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			)
		) {
			if (urlRegex.test(content)) {
				if (message.deletable) message.delete();
				message.channel.send(
					`${message.author}, Bu sunucuda link paylaşımı yapamazsınız.`,
				
				);
			}
		}
*/
		if (
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			)
		) {
			if (
				emojiRegex.test(message) &&
				message.content.match(emojiRegex).length > 3
			) {
				if (message.deletable) message.delete();

				message.channel.send({
					embeds: [
						embed.setDescription(
							`${message.author}, lütfen emoji kullanımını azaltın.`,
						),
					],
				});
			}
		}
	}

	if (
		!message.member.permissions.has(
			Discord.PermissionsBitField.Flags.ManageRoles,
		)
	) {
		if (
			mentionRegex.test(content) &&
			message.content.match(mentionRegex).length >= 5
		) {
			if (message.deletable) message.delete();
			await message.member.roles.add(server.ChatMuteRole);
			await mutes.findOne(
				{ user: message.author.id },
				async (err, doc) => {
					const newMute = new mutes({
						user: message.author.id,
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
						user: message.author.id,
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

			message.channel.send({
				embeds: [
					embed.setDescription(
						`${message.author}, çok fazla etiket attığın için 3 dakika susturuldun.`,
					),
				],
			});
		}
	}

	let prefix = client.settings.PREFIX;
	let canım = false;
	for (const içindeki of prefix) {
		if (message.content.startsWith(içindeki)) canım = içindeki;
	}

	if (!canım) return;

	const args = message.content.slice(canım.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (message.guild && !message.member)
		await message.guild.fetchMember(message.author);

	const cmd =
		client.commands.get(command) ||
		client.commands.get(client.aliases.get(command));

	if (!cmd) return;
	if (cmd && !message.guild && cmd.conf.guildOnly) return;

	message.flags = [];
	while (args[0] && args[0][0] === "-") {
		message.flags.push(args.shift().slice(1));
	}

	/*	if (client.blockedFromCommand.includes(message.author.id)) return;
	if (
		!server?.BotOwner.includes(message.author.id) &&
		!server?.GuildOwner.includes(message.author.id)
	) {
		let blockArr = client.commandBlock.get(message.author.id) || [];

		let datax = {
			içerik: message.content,
			kanal: message.channel.name,
			komut: cmd.conf.name,
		};

		blockArr.push(datax);

		client.commandBlock.set(message.author.id, blockArr);

		let canzade = await client.users.fetch("331846231514939392");

		if (blockArr.length == 9) {
			message.channel.send(
				`${message.author}` +
					"```⛔ Komut kullanımını kötüye kullandığın için engellendi. Açtırmak için ( " +
					canzade.username +
					" ) kişisine ulaşman gerekiyor.```",
			);
			client.channels.cache
				.find((channel) => channel.name === "command-block")
				.send(
					`**${message.author.username}** - ${message.author} (\`${
						message.author.id
					}\`) komut engeli yedi. | Komut kullanım özeti:\n\`\`\`${blockArr
						.map((x) => x.içerik)
						.join("\n")}\nKullandığı komutlar: ${blockArr
						.map((x) => x.komut)
						.join(",")}\nKullandığı kanallar: ${blockArr
						.map((x) => x.kanal)
						.join(",")}\`\`\``,
				);
			client.blockedFromCommand.push(message.author.id);
		}

		setTimeout(() => {
			if (client.commandBlock.has(message.author.id)) {
				client.commandBlock.delete(message.author.id);
			}
		}, ms("1m"));
	}*/

	client.logger.log(
		`${message.author.username} (${message.author.id}) komut kullandı "${cmd.conf.name}" kullandığı kanal ${message.channel.name}`,
		"cmd",
	);

	cmd.run(client, message, args);
};

module.exports.conf = {
	name: "messageCreate",
};

