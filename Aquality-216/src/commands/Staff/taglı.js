const Discord = require("discord.js");
const Tagged = require("../../models/tagged");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
module.exports = {
	conf: {
		name: "taglı",
		usage: ".taglı",
		category: "Global",
		description: "Tag almış üyeyi taglı olarak belirlersiniz.",
		aliases: ["tagli"],
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
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!member) return message.reply("üye belirtmelisin.");
		if (member.id === message.author.id)
			return message.reply("kendini taglı olarak işaretleyemezsin.");
		if (member.user.bot)
			return message.reply("Botlar üzerinde işlem yapamazsın!");
		if (!member.user.username.includes(server.Tag))
			return message.reply(
				`Belirttiğin kullanıcı tagımıza (${server.Tag}) sahip değil!`,
			);
		const tagdata = await Tagged.findOne({
			userID: message.author.id,
			guildID: message.guild.id,
		});
		if (tagdata && tagdata.taglılar.includes(member.user.id))
			return message.reply(
				"Bu üye daha önceden taglı olarak işaretlenmiş, caQal.",
			);
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("kabul")
				.setLabel("Kabul Et")
				.setEmoji("👍")
				.setStyle(Discord.ButtonStyle.Success),

			new Discord.ButtonBuilder()
				.setCustomId("red")
				.setLabel("Reddet")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		let msg = await message.channel.send({
			content: `${member}, ${message.member.toString()} **yetkilisi seni taglı olarak işaretlemek istiyor, kabul ediyor musun?**`,
			components: [row],
		});

		var filter = (interaction) => interaction.user.id === member.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			max: 1,
			time: 60000,
		});

		collector.on("collect", async (interaction) => {
			row.components[0].setDisabled(true);
			row.components[1].setDisabled(true);
			msg.edit({ components: [row] });
			interaction.deferUpdate();

			if (interaction.customId === "kabul") {
				await Tagged.findOneAndUpdate(
					{ guildID: member.guild.id, userID: message.author.id },
					{
						$push: {
							taglılar: member.user.id,
							tarih: moment(Date.now()).format("LLL"),
						},
						$inc: { total: 1 },
					},
					{ upsert: true },
				);
				await client.taskUpdate("Taglı", 1, message.member);

				msg.edit({
					content: `${member}, ${message.member.toString()} **yetkilisi seni taglı olarak işaretlemek istiyor, kabul ediyor musun?**
\`Kullanıcı taglı olarak işaretlendi.\``,
					components: [],
				});
			} else if (interaction.customId === "red") {
				msg.edit({
					content: `${member}, ${message.member.toString()} **yetkilisi seni taglı olarak işaretlemek istiyor, kabul ediyor musun?**
\`Kullanıcı işlemi reddetti.\``,
					components: [],
				});
			}
		});

		collector.on("end", async (interaction) => {
			msg.edit({
				content: `${member}, ${message.member.toString()} yetkilisi seni taglı olarak işaretlemek istiyor, kabul ediyor musun?
\`Süre dolduğu için işlem iptal edildi.\``,
				components: [],
			});
		});
	},
};
