const Discord = require("discord.js");
const oyun = require("../../models/game");

module.exports = {
	conf: {
		name: "cookie",
		usage: "cookie <@/ID>",
		category: "Global",
		description: "Arkadaşınıza cookie verirsiniz.",
		aliases: ["cookie", "kurabiye"],
	},

	async run(client, message, args) {
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!member) return message.reply({ content: "üye belirtmelisin." });
		if (member.id === message.author.id)
			return message.reply({
				content: "kendine kurabiye gönderemezsin.",
			});
		if (member.user.bot)
			return message.reply({ content: "botlara cookie gönderemezsin" });
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("acc-create")
				.setLabel("Hesap Oluştur")
				.setStyle(Discord.ButtonStyle.Primary),
		);
		await oyun.findOne({ userID: message.author.id }, async (err, res) => {
			if (!res) {
				let msg = await message.reply({
					content: `Arkadaşına cookie gönderebilmen için önce sistemimize ait olan bir banka hesabı oluşturman gerekiyor. Aşağıdaki butona tıklayarak halledebilirsin.`,
					components: [row],
				});
				var filter = (interaction) =>
					interaction.user.id === message.author.id;
				const collector = msg.createMessageComponentCollector({
					filter,
					time: 60000,
				});

				collector.on("collect", async (interaction) => {
					if (interaction.customId == "acc-create") {
						row.components[0].setDisabled(true);
						msg.edit({ components: [row] });
						let newBankProfile = new oyun({
							userID: message.author.id,
							money: 150,
						});
						await newBankProfile.save().catch();
						interaction.reply({
							content: `Başarıyla hesabını oluşturdum. Oyunlarımızı oynaman için **150** hediye para kazandın. Tabii bu miktarı oyunları oynayarak katlayabilirsin`,
						});
					}
				});
				collector.on("end", async (interaction) => {
					row.components[0].setDisabled(true);
					msg.edit({ components: [row] });
				});
			} else {
				/*   let newData = new oyun({user: message.author.id, sunucu: message.guild.id}, {$inc: {coin: randomizeCoin}, $set: {coinTime: Date.now()}}, {upsert: true})
             await newData.save().catch();*/

				let timeout = 1000 * 60 * 60 * 24;
				let gunluk = res.cookieTime;
				if (gunluk !== null && timeout - (Date.now() - gunluk) > 0) {
					let time = client.ms(timeout - (Date.now() - gunluk));
					message.reply({
						content: `24 saat içerisinde sadece bir kez cookie gönderebilirsin. ${time.hours} saat ${time.minutes} dakika ${time.seconds} saniye daha beklemelisin.`,
					});
				} else {
					res.userID = message.author.id;
					res.cookie = +1;
					res.cookieTime = Date.now();
					await res.save().catch();
					await client.taskUpdate("Cookie", 1, member);

					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.avatarURL({
								dynamic: true,
							}),
						})
						.setDescription(
							`${message.member.toString()} üyesi sana hediye kurabiye gönderdi.
kurabiyelerin tadını çıkar! 🍪`,
						)
						.setImage(
							"https://cdn.discordapp.com/attachments/927571227533537292/993993716152934410/EW4DzVEXgAAOJy-.jpg",
						)
						.setColor("Random");

					message.channel.send({
						content: member.toString(),
						embeds: [embed],
					});
				}
			}
		});
	},
};
