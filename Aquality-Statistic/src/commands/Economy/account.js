const Discord = require("discord.js");
const oyun = require("../../models/game");
module.exports = {
	conf: {
		name: "hesapoluştur",
		usage: "hesapoluştur",
		category: "Global",
		description: "Hesap oluşturursunuz.",
		aliases: ["hesap"],
	},

	async run(client, message, args) {
		let data = await oyun.findOne({
			userID: message.author.id,
		});
		if (data) {
			message.reply({
				content: "zaten daha önceden bir hesap oluşturmuşsun!",
			});
		} else if (!data) {
			let newBankProfile = new oyun({
				userID: message.author.id,
				money: 150,
			});
			await newBankProfile.save().catch();
			message.reply({
				content: `başarı ile banka hesabını oluşturdun, oyunlarımızı deneyimlemen için hesabına **150** hediye para yolladım. İyi eğlenceler!`,
			});
		}
	},
};
