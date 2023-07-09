const Discord = require("discord.js");
const oyun = require("../../models/game");
module.exports = {
	conf: {
		name: "send",
		usage: "moneysend",
		category: "Global",
		description: "Günlük hediyenizi alırsınız.",
		aliases: ["money-send", "moneysend"],
	},

	async run(client, message, args) {
		let member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!member)
			return message.reply({
				content: `Bir üye etiketle ve tekrardan dene.`,
			});

		if (member.id === message.author.id)
			return message.reply({ content: "Kendine para gönderemezsin!" });
		let betCoin = Number(args[1]);
		if (!betCoin || !Number(args[1]))
			return message.reply({
				content: `Göndermek istediğin para miktarını girmelisin!`,
			});
		let data = await oyun.findOne({
			userID: member.id,
		});
		let can = await oyun.findOne({
			userID: message.author.id,
		});
		if (can.money < betCoin)
			return message.reply({ content: "belirttiğin miktarda paran yok" });

		if (!data) {
			/*let newBankProfile = new oyun({sunucu: message.guild.id, user: member.id, coin: betCoin})
          newBankProfile.save().catch()*/
			message.reply({
				content: `para göndermek istediğin **${member.user.username}** kişisinin bir banka hesabı yok! Lütfen kendisinden \`!hesapoluştur\` komutu ile bir hesap oluşturmasını isteyip daha sonra tekrardan para göndermeyi dene.`,
			});
		} else {
			data.userID = member.id;
			data.money += betCoin;
			await data.save();
			message.reply({
				content: `Belirttiğin **${member.user.username}** kişisine başarı ile **${betCoin}** miktar para gönderdin`,
			});
			can.userID = message.author.id;
			can.money -= betCoin;
			await can.save();
		}
	},
};
