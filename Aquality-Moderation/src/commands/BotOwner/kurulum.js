const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "botkurulum",
		usage: "botkurulum",
		category: "BotOwner",
		description:
			"Bot için gerekli emoji ve log kanallarının kurulumunu sağlar.",
		aliases: [
			"botkurulum",
			"logkur",
			"log-kur",
			"logkurulum",
			"emojikur",
			"emojikurulum",
			"emoji-kur",
			"kurulum",
		],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("EmojiKur")
				.setLabel("Emoji Kurulum")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("LogKur")
				.setLabel("Log Kurulum")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("CANCEL")
				.setLabel("İptal")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		let msg = await message.channel.send({
			components: [row],
			content:
				"Emoji ve log kurulumlarını tamamlamak için aşağıda bulunan buttonlara tıklayınız!",
		});

		var filter = (button) => button.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 30000,
		});

		collector.on("collect", async (button) => {
			if (button.customId === "EmojiKur") {
				row.components[0].setDisabled(true);
				msg.edit({ components: [row] });

				let emojis = [
					{
						name: "zade_slotgif",
						url: "https://cdn.discordapp.com/emojis/926963384556093520.gif?size=96&quality=lossless",
					},
					{
						name: "zade_patlican",
						url: "https://cdn.discordapp.com/emojis/926963384623181874.webp?size=96&quality=lossless",
					},
					{
						name: "no_zade",
						url: "https://cdn.discordapp.com/emojis/1117478610614366299.webp?size=96&quality=lossless",
					},
					{
						name: "yes_zade",
						url: "https://cdn.discordapp.com/emojis/1117478421488996382.webp?size=96&quality=lossless",
					},
					{
						name: "zade_kalp",
						url: "https://cdn.discordapp.com/emojis/926963384774197298.webp?size=96&quality=lossless",
					},
					{
						name: "zade_kiraz",
						url: "https://cdn.discordapp.com/emojis/926963384350539797.webp?size=96&quality=lossless",
					},
					{
						name: "zade_para",
						url: "https://cdn.discordapp.com/emojis/926963384937762916.gif?size=96&quality=lossless",
					},
					{
						name: "zade_xp",
						url: "https://cdn.discordapp.com/emojis/1054127448037544036.gif?size=96&quality=lossless",
					},
					{
						name: "zade_ses",
						url: "https://cdn.discordapp.com/emojis/1054126914635317278.gif?size=96&quality=lossless",
					},
					{
						name: "zade_sariyildiz",
						url: "https://cdn.discordapp.com/emojis/1054127446468853790.gif?size=96&quality=lossless",
					},
					{
						name: "zade_mesaj",
						url: "https://cdn.discordapp.com/emojis/1054126911669944432.gif?size=96&quality=lossless",
					},
					{
						name: "zade_hazine",
						url: "https://cdn.discordapp.com/emojis/1054127444929560636.gif?size=96&quality=lossless",
					},
					{
						name: "zade_cookie",
						url: "https://cdn.discordapp.com/emojis/1054127442744332360.gif?size=96&quality=lossless",
					},
					{
						name: "zade_altinn",
						url: "https://cdn.discordapp.com/emojis/1054126907945406524.gif?size=96&quality=lossless",
					},
					{
						name: "zade_altin",
						url: "https://cdn.discordapp.com/emojis/1054127440307421355.gif?size=96&quality=lossless",
					},
					{
						name: "yukleniyorgif",
						url: "https://cdn.discordapp.com/emojis/1054126904699002930.gif?size=96&quality=lossless",
					},
					{
						name: "sondolu",
						url: "https://cdn.discordapp.com/emojis/1054127437203648633.webp?size=96&quality=lossless",
					},
					{
						name: "sonbos",
						url: "https://cdn.discordapp.com/emojis/1054126901364527175.webp?size=96&quality=lossless",
					},
					{
						name: "ortadolu",
						url: "https://cdn.discordapp.com/emojis/1054126899674226749.webp?size=96&quality=lossless",
					},
					{
						name: "ortabos",
						url: "https://cdn.discordapp.com/emojis/1054126897795190935.webp?size=96&quality=lossless",
					},
					{
						name: "online",
						url: "https://cdn.discordapp.com/emojis/1054126896113274940.webp?size=96&quality=lossless",
					},
					{
						name: "offline",
						url: "https://cdn.discordapp.com/emojis/1054126894511038554.webp?size=96&quality=lossless",
					},
					{
						name: "mikrofon_kapali",
						url: "https://cdn.discordapp.com/emojis/1054126891935748218.webp?size=96&quality=lossless",
					},
					{
						name: "kulaklik_kapali",
						url: "https://cdn.discordapp.com/emojis/1054126890153164901.webp?size=96&quality=lossless",
					},
					{
						name: "ilkdolu",
						url: "https://cdn.discordapp.com/emojis/1054126888685142076.webp?size=96&quality=lossless",
					},
					{
						name: "ilkbos",
						url: "https://cdn.discordapp.com/emojis/1054126886860628099.webp?size=96&quality=lossless",
					},
					{
						name: "idle",
						url: "https://cdn.discordapp.com/emojis/1054126884281126912.webp?size=96&quality=lossless",
					},
					{
						name: "hareketliayicik",
						url: "https://cdn.discordapp.com/emojis/1054126881823281272.gif?size=96&quality=lossless",
					},
					{
						name: "dnd",
						url: "https://cdn.discordapp.com/emojis/1054126879596089414.webp?size=96&quality=lossless",
					},
				];

				button.reply({ content: "Emoji kurulumu başlatılıyor." });

				for (let index = 0; index < emojis.length; index++) {
					let target = emojis[index];
					await message.guild.emojis
						.create({
							name: target.name,
							attachment: target.url,
						})
						.then((emoji) =>
							message.channel.send({
								content: `Başarıyla ${emoji.name} adında emoji oluşturuldu. (${emoji})`,
							}),
						)
						.catch(console.error);
				}
			} else if (button.customId === "LogKur") {
				row.components[1].setDisabled(true);
				msg.edit({ components: [row] });

				button.reply({
					content: `Bot loglarının kurulumuna başlanıyor.`,
				});
				const parent = await message.guild.channels.create({
					name: "Zade Logs",
					type: Discord.ChannelType.GuildCategory,
				});
				await message.guild.channels.create({
					name: "join-family",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
				await message.guild.channels.create({
					name: "leave-family",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
				await message.guild.channels.create({
					name: "yetkili-tag",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
				await message.guild.channels.create({
					name: "yasaklı-tag",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
				await message.guild.channels.create({
					name: "command-block",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
				await message.guild.channels.create({
					name: "rol-yönet",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
				await message.guild.channels.create({
					name: "sağ-tık-ceza-işlem",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
				await message.guild.channels.create({
					name: "unban-log",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
				await message.guild.channels.create({
					name: "stream-cezalı",
					type: Discord.ChannelType.GuildText,
					parent: parent.id,
				});
			} else if (button.customId === "CANCEL") {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				row.components[2].setDisabled(true);
				msg.edit({ components: [row] });

				button.reply({ content: "İşlem iptal edildi" });
			}
		});
		collector.on("end", async (button) => {
			row.components[0].setDisabled(true);
			row.components[1].setDisabled(true);
			row.components[2].setDisabled(true);
			msg.edit({ components: [row] });
		});
	},
};
