const Discord = require("discord.js");
const oyun = require("../../models/game");
module.exports = {
	conf: {
		name: "cf",
		usage: "cf <bahis>",
		category: "Global",
		description:
			"Para çevirirsiniz kazanırsanız oynadığınız paranın 2 katını alırsınız.",
		aliases: ["cf"],
	},

	async run(client, message, args) {
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("acc-create")
				.setLabel("Hesap Oluştur")
				.setStyle(Discord.ButtonStyle.Primary),
		);
		oyun.findOne({ userID: message.author.id }, async (err, res) => {
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
				if (!res.money)
					return message.reply({ content: "Hiç paran yok!" });
				if (betCoin > 50000)
					return message.reply({
						content: "Maksimum 50.000'lik bir bahis koyabilirsin!",
					});
				if (res.money < betCoin)
					return message.reply({
						content: `Belirttiğin miktarda paran yok! Belirttiğin miktarda para ile oynayabilmek için \`${
							betCoin - res.money
						}\` daha paraya ihtiyacın var. Para sayın (**${
							res.money
						}** para)`,
					});
				let mesaj = await message.reply({
					content: `
**${
						message.author.username
					}** :dollar: ${betCoin} para harcadı \nPara dönüyor... ${client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.CoinFlip,
					)}
`,
				});

				setTimeout(async () => {
					const chance = ["Tebrikler", "Kaybettin"];
					const canWin =
						chance[Math.floor(Math.random() * chance.length)];

					if (canWin == "Tebrikler") {
						res.money += betCoin * 2 - betCoin;
						await res.save();
						mesaj.edit({
							content: `
**${
								message.author.username
							}** :dollar: ${betCoin} para harcadı \nPara dönüyor... ${client.emojis.cache.find(
								(x) => x.name === client.settings.emojis.Coin,
							)} ve 💸 **${betCoin * 2}** kazandın
`,
						});
					} else {
						res.money -= betCoin;
						await res.save();
						mesaj.edit({
							content: `
**${
								message.author.username
							}** :dollar: ${betCoin} para harcadı \nPara dönüyor... ${client.emojis.cache.find(
								(x) => x.name === client.settings.emojis.Coin,
							)} ve paranın hepsini kaybettin... :c`,
						});
					}
				}, 2000);
			}
		});
	},
};
