const Discord = require("discord.js");
const RegisterModel = require("../../models/kayıtlar.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "topteyit",
		usage: "topteyit",
		category: "Register",
		description: "Sunucu kayıt top10 listesini görüntülersiniz.",
		aliases: ["topteyit", "top-teyit"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.RegisterAuth.includes(r.id),
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
			.setColor("Aqua");
		let description = "";

		const models = await RegisterModel.find({});
		const topModels = models.slice(0, 25);

		for (let i = 0; i < topModels.length; i++) {
			const model = topModels[i];
			const user = message.client.users.cache.get(model.user);
			const mention = user ? user.toString() : model.user;
			var zade = `Toplam **${model.erkek}** erkek, **${model.kadın}** kadın kayıt etmişsiniz.`;
			description += `\`${i + 1}.\` ${mention}: \`${
				model.toplam
			} mesaj\`${model.user === message.author.id ? "**(Siz)**" : ""}\n`;
		}

		const self = models.find((x) => x.user === message.author.id);
		const index = models.indexOf(self);

		embed.setDescription(
			"Top 25 Teyit sıralaması aşağıda belirtilmiştir.\n\n" +
				description +
				"\n" +
				(index == -1
					? ""
					: `Siz ${index + 1} sırada bulunuyorsunuz. ${zade}`),
		);

		message.reply({ embeds: [embed] });
	},
};
