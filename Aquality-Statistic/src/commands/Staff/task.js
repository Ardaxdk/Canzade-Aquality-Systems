const Discord = require("discord.js");
const tasks = require("../../models/task");
const moment = require("moment");
let serverSettings = require("../../models/serverSettings");
require("moment-duration-format");

module.exports = {
	conf: {
		name: "task",
		usage: ".task",
		category: "Staff",
		description: "Görev durumunuzu görüntülersiniz.",
		aliases: ["task", "tasks"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});

		if (
			!message.member.roles.cache.some((r) =>
				server.BotCommandRole.includes(r.id),
			)
		)
			return;
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;
		const user = member.user;

		const task = await tasks.find({ userID: user.id });
		if (!task || task.length <= 0)
			return message.reply({
				content: `Aktif bir göreviniz bulunmamaktadır. Lütfen yetkili sorumluluk kanalından sorumluluk seçiniz.`,
			});

		const embed = new Discord.EmbedBuilder()
			.setColor("Aqua")

			.setAuthor({
				name: user.username,
				iconURL: user.avatarURL({ dynamic: true }),
			})
			.setDescription(
				`${
					task.length == 5
						? `**${
								task.length
						  }** görevi tamamlamak sana fazladan ${client.emojis.cache.find(
								(x) => x.name === "zade_xp",
						  )} **500** Puan kazandıracak!\n`
						: `Bütün görevleri seçerek fazladan **500** puan kazanabilirsin!`
				}`,
			)
			.setThumbnail(
				"https://cdn.discordapp.com/emojis/1054127444929560636.gif?size=100&quality=lossless",
			)
			.setFooter({ text: "Görevler her gün 00.00 da sıfırlanır!" });

		task.map((task) => {
			const emoji = task.type
				.replace(
					/Mesaj/i,
					client.emojis.cache.find((x) => x.name === "zade_mesaj"),
				)
				.replace(
					/Ses/i,
					client.emojis.cache.find((x) => x.name === "zade_ses"),
				)
				.replace(
					/Taglı/i,
					client.emojis.cache.find((x) => x.name === "zade_ses"),
				)
				.replace(
					/Cookie/i,
					client.emojis.cache.find((x) => x.name === "zade_cookie"),
				)
				.replace(
					/Davet/i,
					client.emojis.cache.find((x) => x.name === "zade_ses"),
				);
			embed.addFields({
				name: `${task.description}`,
				value: `${emoji} ${client.progressBar(
					task.level,
					task.target,
					8,
				)} ${
					task.type == "Ses"
						? `\`${moment
								.duration(task.level)
								.format("H [saat], m [dk]")} / ${moment
								.duration(task.target)
								.format("H [saat], m [dk]")}\``
						: ` \`${
								task.level >= task.target
									? "Tamamlandı."
									: `${task.level} / ${task.target}`
						  }\``
				}\n**Ödül:** ${client.emojis.cache.find(
					(x) => x.name === "zade_hazine",
				)} \`${task.point}\` Puan **Bitiş:** <t:${Math.floor(
					task.end / 1000,
				)}:R>`,
			});
		});

		return message.channel.send({ embeds: [embed] });
	},
};
