const Discord = require("discord.js");
const oyun = require("../../models/game");
module.exports = {
	conf: {
		name: "daily",
		usage: "daily",
		category: "Global",
		description: "Günlük hediyenizi alırsınız.",
		aliases: ["günlük", "gunluk"],
	},

	async run(client, message, args) {
		let randomizeCoin = Math.floor(Math.random() * 450) + 1;
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("acc-create")
				.setLabel("Hesap Oluştur")
				.setStyle(Discord.ButtonStyle.Primary),
		);
		oyun.findOne({ userID: message.author.id }, async (err, res) => {
			if (!res) {
				let msg = await message.reply({
					content: `Hey! Dur biraz, günlük hediyeni alabilmen için ilk önce kendi banka hesabını oluşturman gerekiyor. Aşağıdaki butona tıklayarak hesap oluşturabilirsin.`,
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
				let timeout = 1000 * 60 * 60 * 24;
				let gunluk = res.coinTime;
				if (gunluk !== null && timeout - (Date.now() - gunluk) > 0) {
					let time = client.ms(timeout - (Date.now() - gunluk));
					message.reply({
						content: `Hey! Dur, günlük hediyeni zaten almışsın. Günlük hediyeni tekrardan alabilmen için ${time.hours} saat ${time.minutes} dakika ${time.seconds} saniye daha beklemelisin.`,
					});
				} else {
					res.userID = message.author.id;
					res.money += randomizeCoin;
					res.coinTime = Date.now();
					await res.save().catch();
					message.reply({
						content: `${client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.Coin,
						)}| Bugünlük **${randomizeCoin}** para aldın!`,
					});
				}
			}
		});
	},
};
