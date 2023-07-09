const Discord = require("discord.js");
const oyun = require("../../models/game");
const buttonClicks = new Map();
module.exports = {
	conf: {
		name: "treasure",
		usage: "hazine",
		category: "Global",
		description: "Hazine bulursunuz.",
		aliases: ["hazine"],
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
				let timeout = 1000 * 60 * 60 * 24;
				let gunluk = res.treasureTime;
				if (gunluk !== null && timeout - (Date.now() - gunluk) > 0) {
					let time = client.ms(timeout - (Date.now() - gunluk));
					message.reply({
						content: `Hey! Dur, zaten şansını denemişsin, bu oyunu günde 1 kere oynayabilirsin. Bu oyunu tekrardan oynayabilmen için ${time.hours} saat ${time.minutes} dakika ${time.seconds} saniye daha beklemelisin.`,
					});
				} else {
					const buttonRows = [];

					const winningRow = Math.floor(Math.random() * 3);
					const winningColumn = Math.floor(Math.random() * 3);

					for (let i = 0; i < 3; i++) {
						const buttons = [];

						for (let j = 0; j < 3; j++) {
							const button = new Discord.ButtonBuilder()
								.setCustomId(`button_${i}_${j}`)
								.setEmoji("❌")
								.setStyle(Discord.ButtonStyle.Primary);

							buttons.push(button);
						}

						const row =
							new Discord.ActionRowBuilder().addComponents(
								buttons,
							);
						buttonRows.push(row);
					}

					const msg = await message.reply({
						content:
							"Aşağıdaki butonların birisinde ödül saklı. Eğer bulabilirsen hediye para kazanacaksın. Unutma sadece 3 hakkın var.",
						components: buttonRows,
					});

					const filter = (i) => i.user.id == message.author.id;

					const collector = msg.createMessageComponentCollector({
						time: 60000,
						componentType: Discord.ComponentType.Button,
						filter,
					});

					collector.on("collect", async (interaction) => {
						if (!buttonClicks.has(message.author.id)) {
							buttonClicks.set(message.author.id, 3);
							const [_, r, c] = interaction.customId.split("_");
							const column = parseInt(c);
							const row = parseInt(r);

							const component =
								buttonRows[row].components[column];

							if (row == winningRow && column == winningColumn) {
								msg.edit({
									content: `Tebrikler! Gizli hazineyi bulmayı başardın. **${randomizeCoin}** ödül kazandın!`,
									components: [],
								});
								res.userID = message.author.id;
								res.money += randomizeCoin;
								res.treasureTime = Date.now();
								await res.save().catch();
								buttonClicks.delete(message.author.id);
							} else {
								component
									.setStyle(Discord.ButtonStyle.Danger)
									.setDisabled(true)
									.setEmoji("✖️");
								interaction.deferUpdate();

								await msg.edit({ components: buttonRows });
							}
						} else {
							const clickCount = buttonClicks.get(
								message.author.id,
							);
							if (clickCount >= 3) {
								msg.edit({
									content:
										"Üzgünüm! 3 denemende de ödülü bulma konusunda başarısız oldun daha sonra tekrar dene!",
									components: [],
								});
								res.userID = message.author.id;
								res.treasureTime = Date.now();
								await res.save().catch();
								buttonClicks.delete(message.author.id);
							}
						}
					});

					collector.on("end", async () => {
						msg.edit({
							content: "Süre dolduğu için oyun sona erdi.",
							components: [],
						});
					});
				}
			}
		});
	},
};
