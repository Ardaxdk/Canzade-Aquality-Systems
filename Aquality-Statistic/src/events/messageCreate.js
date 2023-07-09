const VoiceModel = require("../models/voiceModel");
const ChannelModel = require("../models/channelModel");
let serverSettings = require("../models/serverSettings");
const Discord = require("discord.js");
const oyun = require("../models/game");
const ms = require("ms");
let messageCount = 0;
module.exports = async (message) => {
	let server = await serverSettings.findOne({});

	if (
		!message.guild ||
		message.guild.id != client.settings.GUILD_ID ||
		!message.content ||
		message.author.bot
	)
		return;

	let channelModel = await ChannelModel.findOne({
		channelID: message.channel.id,
		guildID: message.guild.id,
		userID: message.author.id,
	});
	if (!channelModel)
		channelModel = new ChannelModel({
			channelID: message.channel.id,
			guildID: message.guild.id,
			userID: message.author.id,
		});
	channelModel.type = "GUILD_TEXT";
	channelModel.data += 1;
	await channelModel.save();
	let voiceModel = await VoiceModel.findOne({
		userID: message.author.id,
		guildID: message.guild.id,
	});
	if (!voiceModel) {
		voiceModel = new VoiceModel({
			userID: message.author.id,
			guildID: message.guild.id,
		});
	}
	const time = client.ChannelJoined.get(message.author.id);
	if (time) {
		const diffrence = Date.now() - time;
		voiceModel.voice += diffrence;
		client.ChannelJoined.set(message.author.id, Date.now());
	}

	voiceModel.messages += 1;
	await client.checkReward(message.member, voiceModel, client);
	await client.taskUpdate("Mesaj", 1, message.member);
	await voiceModel.save();
	if (message.channel.id == server.GeneralChat) {
		messageCount++;
		if (messageCount >= 100) {
			messageCount = 0;

			const code = generateCode();

			let kaybedenler = new Map();

			let buttons = [
				new Discord.ButtonBuilder()
					.setCustomId("yanlis1")
					.setLabel(generateCode())
					.setStyle(Discord.ButtonStyle.Secondary),
				new Discord.ButtonBuilder()
					.setCustomId("yanlis2")
					.setLabel(generateCode())
					.setStyle(Discord.ButtonStyle.Secondary),
				new Discord.ButtonBuilder()
					.setCustomId("yanlis3")
					.setLabel(generateCode())
					.setStyle(Discord.ButtonStyle.Secondary),
				new Discord.ButtonBuilder()
					.setCustomId("dogru")
					.setLabel(code)
					.setStyle(Discord.ButtonStyle.Secondary),
				new Discord.ButtonBuilder()
					.setCustomId("yanlis5")
					.setLabel(generateCode())
					.setStyle(Discord.ButtonStyle.Secondary),
			];
			let buttonrandom = client.shuffle(buttons);

			let button = new Discord.ActionRowBuilder().addComponents(
				buttonrandom,
			);

			let msg = await message.channel.send({
				content: `Doğru buttona 10 saniye içinde sen tıklarsan **ödül** kazanacaksın. Unutma sadece **1** hakkın var! :tada: :tada: :tada:`,
				components: [button],
			});
			var filter = (interaction) => interaction.user.id;
			const collector = msg.createMessageComponentCollector({
				filter,
				time: 10000,
			});

			collector.on("collect", async (interaction) => {
				if (interaction.customId === "dogru") {
					if (kaybedenler.has(interaction.user.id))
						return interaction.reply({
							content:
								"Zaten şansını deneyip kaybetmişsin bir sonraki oyunu beklemen gerek!",
							ephemeral: true,
						});
					let randomizeCoin = Math.floor(Math.random() * 450) + 1;
					interaction.reply({
						content: `${interaction.user} Doğru cevap! **${randomizeCoin}** coin kazandınız.`,
					});
					if (msg) msg.edit({ components: [] });

					let data = await oyun.findOne({
						userID: interaction.user.id,
					});

					if (!data) {
						let newData = new oyun({
							userID: interaction.user.id,
							money: randomizeCoin,
						});
						await newData
							.save()
							.catch((err) =>
								console.log(
									`Oyuncuza yaz kazandan para eklenemedi (yeni data açılamadı) !\nSorun:` +
										err,
								),
							);
					} else {
						data.userID = interaction.user.id;
						data.money = data.money + randomizeCoin;
						await data.save();
					}
				} else {
					if (kaybedenler.has(interaction.user.id))
						return interaction.reply({
							content:
								"Zaten şansını deneyip kaybetmişsin bir sonraki oyunu beklemen gerek!",
							ephemeral: true,
						});
					kaybedenler.set(interaction.user.id, true);
					interaction.reply({
						content: "Yanlış cevap!",
						ephemeral: true,
					});
				}
			});
			collector.on("end", async (interaction) => {
				if (msg) msg.edit({ components: [] });
			});
		}
	}

	function generateCode() {
		const characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let code = "";
		for (let i = 0; i < 5; i++) {
			code += characters.charAt(
				Math.floor(Math.random() * characters.length),
			);
		}
		return code;
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

	if (client.blockedFromCommand.includes(message.author.id)) return;
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
	}

	client.logger.log(
		`${message.author.username} (${message.author.id}) komut kullandı "${cmd.conf.name}" kullandığı kanal ${message.channel.name}`,
		"cmd",
	);

	cmd.run(client, message, args);
};

module.exports.conf = {
	name: "messageCreate",
};

