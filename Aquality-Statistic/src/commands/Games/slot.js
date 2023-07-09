const Discord = require("discord.js");
const oyun = require("../../models/game");
module.exports = {
	conf: {
		name: "slot",
		usage: "slot",
		category: "Global",
		description: "Slot çevirirsiniz.",
		aliases: ["s"],
	},

	async run(client, message, args) {
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("acc-create")
				.setLabel("Hesap Oluştur")
				.setStyle(Discord.ButtonStyle.Primary),
		);
		await oyun.findOne({ userID: message.author.id }, async (err, res) => {
			if (!res) {
				let msg = await message.reply({
					content: `Hey! Dur biraz, oyunlarımızı oynayabilmen için ilk önce kendi banka hesabını oluşturman gerekiyor. Aşağıdaki butona tıklayarak hesap oluşturabilirsin.`,
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
				let betCoin = Number(args[0]);

				if (args[0] === "all") {
					if (res.money >= 50000) betCoin = 50000;
					if (res.money < 50000) betCoin = res.money;
					if (res.money < 1)
						return message.reply({ content: "Hiç paran yok!" });
				}
				//betCoin = betCoin.toFixed(0);
				if (isNaN(betCoin))
					return message.reply({
						content: "Harf yerine sayı girmelisin!",
					});
				if (betCoin > 50000)
					return message.reply({
						content:
							"50.000 paradan fazla bir para ile oyun oynamayazsın",
					});
				if (!res.money)
					return message.reply({ content: "Hiç paran yok!" });
				if (res.money < betCoin)
					return message.reply({
						content: `Bu miktarla oynayabilmek için \`${
							betCoin - res.money
						}\` daha paraya ihtiyacın var.`,
					});
				const emojis = {
					kalp: client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.Kalp,
					),
					patlican: client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.Patlıcan,
					),
					kiraz: client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.Kiraz,
					),
				};

				const slotgif = client.emojis.cache.find(
					(x) => x.name === client.settings.emojis.ZadeSlot,
				);

				const results = [];
				let winnings = 0;

				for (let i = 0; i < 3; i++) {
					const randomEmoji =
						Object.values(emojis)[
							Math.floor(
								Math.random() * Object.values(emojis).length,
							)
						];
					results.push(randomEmoji);
				}

				const slotMessage = await message.channel.send({
					content: `
\`___SLOTS___  \`
${slotgif} ${slotgif} ${slotgif}   ${message.author.username} bahis :dollar: ${betCoin}
**\`|         |\`**
**\`|         |\`**`,
				});

				setTimeout(async () => {
					const finalResults = [];
					for (let i = 0; i < results.length; i++) {
						const randomEmoji =
							Object.keys(emojis)[
								Math.floor(
									Math.random() * Object.keys(emojis).length,
								)
							];
						finalResults.push(emojis[randomEmoji]);
					}

					if (finalResults.every((val) => val === finalResults[0])) {
						if (finalResults[0] === emojis.patlican) {
							winnings = 1;
							// 3 patlıcan durursa bahsinin aynısını kazanır (1 kat)
						} else if (finalResults[0] === emojis.kiraz) {
							winnings = 2; // 3 kiraz durursa bahsinin 2 katını kazanır
						} else if (finalResults[0] === emojis.kalp) {
							winnings = 4; // 3 kalp durursa bahsinin 4 katını kazanır
						}
					}

					if (winnings > 0) {
						slotMessage.edit({
							content: `
\`___SLOTS___  \`
${finalResults.join("")}   ${message.author.username} bahis :dollar: ${betCoin}
**\`|         |\`** ve ${betCoin * winnings} kazandın 💸
**\`|         |\`**`,
						});
						res.money += betCoin * winnings - betCoin;
						await res.save();
					} else {
						slotMessage.edit({
							content: `
\`___SLOTS___  \`
${finalResults.join("")}   ${message.author.username} bahis :dollar: ${betCoin}
**\`|         |\`** ve paranın hepsini kaybettin... :c
**\`|         |\`**`,
						});
						res.money -= betCoin;
						await res.save();
					}
				}, 3000);
			}
		});
	},
};
