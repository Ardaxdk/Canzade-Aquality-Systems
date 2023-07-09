const Discord = require("discord.js");
const StaffModel = require("../../models/staff");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "topyt",
		usage: ".topyt",
		category: "Global",
		description: "Sunucu yetkilisi çekme top listesini görüntülersiniz.",
		aliases: ["topyetkili", "topyt"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({});

		if (
			!message.member.roles.cache.some((r) =>
				server.BotCommandRole.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({
					display: true,
				}),
			})
			.setColor("Random");
		let description = "";

		const models = await StaffModel.find({
			guildID: message.guild.id,
		});
		const topModels = models.slice(0, 25);

		for (let i = 0; i < topModels.length; i++) {
			const model = topModels[i];
			const user = message.client.users.cache.get(model.userID);
			const mention = user ? user.toString() : model.userID;
			description += `\`${i + 1}.\` ${mention}: \`${
				model.total
			} Başarılı\` - \`${model.total - model.leave} Toplam\` ${
				model.userID === message.author.id ? "**(Siz)**" : ""
			}\n`;
		}

		const self = models.find((x) => x.userID === message.author.id);
		const index = models.indexOf(self);

		let toplam = models.map((x) => x.total).reduce((a, b) => a + b, 0);

		let leave = models.map((x) => x.leave).reduce((a, b) => a + b, 0);

		embed.setDescription(
			`Top 20 yetkili alım sıralaması aşağıda belirtilmiştir.
             **30** günde \`${toplam}\` Başarılı - \`${
				toplam - leave
			}\` toplam yetkili alım işlemi yapıldı. \n\n` +
				description +
				"\n" +
				(index == -1 ? "" : `Siz ${index + 1}. sırada bulunuyorsunuz.`),
		);

		message.reply({ embeds: [embed] });
	},
};
