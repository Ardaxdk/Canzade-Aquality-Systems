const Discord = require("discord.js");
const kayıtlar = require("../../models/kayıtlar.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "kullanıcıpanel",
		usage: "panel",
		category: "BotOwner",
		description: "Kullanıcı panel mesajını attırmaya sağlar.",
		aliases: ["panel", "kullanıcıpanel"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("memberJoinedServer")
				.setLabel("1")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("historyName")
				.setLabel("2")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("activePenalties")
				.setLabel("3")
				.setStyle(Discord.ButtonStyle.Primary),
		);

		const row2 = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("penaltyPoints")
				.setLabel("4")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("historyPenalties")
				.setLabel("5")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("notes")
				.setLabel("6")
				.setStyle(Discord.ButtonStyle.Primary),
		);

		const row3 = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("penaltiesNumber")
				.setLabel("7")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("memberRoles")
				.setLabel("8")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("createdAt")
				.setLabel("9")
				.setStyle(Discord.ButtonStyle.Primary),
		);

		message.channel.send({
			content: `
Aşağıdaki menüden kendinize bir işlem seçip sunucu içi depolanan verilerinizi sorgulayabilirsiniz. Verileriniz sadece sizin görebileceğiniz şekilde gönderilir.
• 1: Sunucuya giriş tarihinizi öğrenin.
• 2: Kayıt olmuş olduğunuz isimleri öğrenin.
• 3: Devam eden cezanız (varsa) hakkında bilgi alın.
 
• 4: Ceza puanınızı öğrenin.
• 5: Geçmiş cezalarınızı öğrenin.
• 6: Notlarınıza bakın.

• 7: Ceza sayınız öğrenin.
• 8: Üzerinizdeki rolleri sıralayın.
• 9: Hesabınızın açılış tarihini öğrenin.`,
			components: [row, row2, row3],
		});
	},
};
