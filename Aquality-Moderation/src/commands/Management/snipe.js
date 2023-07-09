const Discord = require("discord.js");
const moment = require("moment");
let serverSettings = require("../../models/serverSettings");
require("moment-duration-format");
moment.locale("tr");
module.exports = {
	conf: {
		name: "snipe",
		usage: "snipe",
		category: "Management",
		description: "Kanalda silinmiş en son mesajı gösterir.",
		aliases: ["snipe"],
	},
	//TODO
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.JailAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let mesaj = client.snipe.get(message.channel.id);
		if (!mesaj) return message.react("🚫");
		const embed = new Discord.EmbedBuilder()
			.setColor("Random")
			.setAuthor({
				name: mesaj.author.username,
				iconURL: mesaj.author.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`\`\`\`${message.content}\`\`\``)
			.setFooter({
				text:
					"Silinen Tarih: " +
					moment(mesaj.createdTimestamp).add(3, "hour").format("ll") +
					", " +
					moment(mesaj.createdTimestamp).add(3, "hour").format("LTS"),
			});
		message.channel.send({ embeds: [embed] }).then((msg) => {
			setTimeout(() => {
				msg.delete();
			}, 3500);
		});
		client.snipe.delete(message.channel.id);
	},
};
