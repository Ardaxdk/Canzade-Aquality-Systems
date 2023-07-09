const Discord = require("discord.js");
const oyun = require("../../models/game");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
	conf: {
		name: "param",
		usage: "money",
		category: "Global",
		description: "Hesabınızda kaç para olduğunu görürsünüz.",
		aliases: ["param", "money", "cash", "balance", "para"],
	},

	async run(client, message, args) {
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("acc-create")
				.setLabel("Hesap Oluştur")
				.setStyle(Discord.ButtonStyle.Primary),
		);

		oyun.findOne({ userID: member.id }, async (err, res) => {
			if (!res) {
				let msg = await message.reply({
					content: `Hey! Dur biraz, ne kadar paran olduğunu görmen için ilk önce kendi para hesabını oluşturman gerekiyor. Aşağıdaki butona tıklayarak hesap oluşturabilirsin.`,
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
				const canvas = createCanvas(500, 300);
				const context = canvas.getContext("2d");

				const background = await loadImage(
					"https://cdn.discordapp.com/attachments/1013200757048234005/1127668814578995251/InShot_20230709_213307481.jpg",
				);

				const messageMember = await loadImage(
					message.author.displayAvatarURL({ extension: "png" }),
				);

				context.drawImage(
					background,
					0,
					0,
					canvas.width,
					canvas.height,
				);

				(context.font = "20px Marlin Geo Black"),
					(context.fillStyle = "#ffffff");
				context.fillText(
					`\n${member.user.username} Banka Hesabı`,
					canvas.width / 4.1,
					canvas.height / 7,
				);

				(context.font = "20px Marlin Geo Black"),
					(context.fillStyle = "#ffffff");
				context.fillText(
					`Para Miktarı: ${res.money}`,
					canvas.width / 2.1,
					canvas.height / 1.95,
				);

				(context.font = "30px Marlin Geo Black"),
					(context.fillStyle = "#ffffff");
				context.fillText(
					`${member.user.id}`,
					canvas.width / 23,
					canvas.height / 1.3,
				);
				context.save();

				roundedImage(context, 23, 20, 90, 90, 25);
				context.clip();

				context.drawImage(messageMember, 23, 20, 90, 90);
				context.closePath();

				context.clip();
				function roundedImage(ctx, x, y, width, height, radius) {
					ctx.beginPath();
					ctx.moveTo(x + radius, y);
					ctx.lineTo(x + width - radius, y);
					ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
					ctx.lineTo(x + width, y + height - radius);
					ctx.quadraticCurveTo(
						x + width,
						y + height,
						x + width - radius,
						y + height,
					);
					ctx.lineTo(x + radius, y + height);
					ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
					ctx.lineTo(x, y + radius);
					ctx.quadraticCurveTo(x, y, x + radius, y);
					ctx.closePath();
				}
				const attachment = new Discord.AttachmentBuilder(
					canvas.toBuffer(),
					{ name: "unkown.png" },
				);

				message.channel.send({
					content: `> ${client.emojis.cache.find(
						(x) => x.name === "zade_sariyildiz",
					)} [ __${member}__ ] kullanıcısının banka kartı!`,
					files: [attachment],
				});
			}
		});
	},
};
