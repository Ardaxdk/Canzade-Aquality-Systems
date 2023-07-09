const Discord = require("discord.js");
const Yetkili = require("../../models/staff");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
module.exports = {
	conf: {
		name: "yetkiver",
		usage: ".yetkiver",
		category: "Global",
		description: "Taglı üyeye yetki verirsiniz.",
		aliases: ["yetkiver"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});

		if (
			!message.member.roles.cache.some((r) =>
				server.RoleManageAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return client.send(
				"Gerekli yetkiye sahip değilsin",
				message.author,
				message.channel,
			);
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);

		if (!member) return message.reply("üye belirtmelisin!");

		if (member.id == message.author.id)
			return message.reply("kendini yetkili yapamazsın.");
		if (member.user.bot)
			return message.reply("Botlar üzerinde işlem yapamazsın!");

		if (
			member.roles.cache.some(
				(role) =>
					message.guild.roles.cache.get(`${server.BotCommandRole}`)
						.rawPosition <= role.rawPosition,
			)
		)
			return message.reply("bu üye zaten yetkili.");

		// if (!member.user.username.includes(server.Tag))
		// 	return message.reply(
		// 		`Belirttiğin kullanıcı tagımıza (${server.Tag}) sahip değil!`,
		// 	);
		const staffdata = await Yetkili.findOne({
			userID: message.author.id,
			guildID: message.guild.id,
		});
		if (staffdata && staffdata.yetkililer.includes(member.user.id))
			return message.reply(
				"Bu üye daha önceden yetkili olarak işaretlenmiş, caQal.",
			);

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("evet")
				.setLabel("EVET")
				.setStyle(Discord.ButtonStyle.Success),
			new Discord.ButtonBuilder()
				.setCustomId("hayır")
				.setLabel("HAYIR")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		let msg = await message.channel.send({
			content: `${member}, ${message.author} **Kişisi tarafından yetkili olmayı onaylıyor musunuz?**`,
			components: [row],
		});

		var filter = (button) => button.user.id === member.user.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 60000,
		});

		// collector.on("collect", async (interaction) => {
		// 	row.components[0].setDisabled(true);
		// 	row.components[1].setDisabled(true);
		// 	msg.edit({ components: [row] });
		// 	interaction.deferUpdate();

		// 	if (interaction.customId === "evet") {
		await Yetkili.findOneAndUpdate(
			{ guildID: member.guild.id, userID: message.author.id },
			{
				$push: {
					yetkililer: member.user.id,
					tarih: moment(Date.now()).format("LLL"),
					sure: 1000 * 60 * 60 * (Math.random() * 65 + 30),

					minSure: 1000 * 60 * 60 * (Math.random() * 3 + 5),
				},
				$inc: { total: 1 },
			},
			{ upsert: true },
		);
		await client.taskUpdate("Yetkili", 1, message.member);

		const random =
			server.BeginningRole[
				Math.floor(Math.random() * server.BeginningRole.length)
			];

		await member.roles.add(random);
		await member.roles.add(server.BotCommandRole);

		const embed = new Discord.EmbedBuilder()
			.setColor("Aqua")
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({
					dynamic: true,
				}),
			})
			.setDescription(
				`${member} kişisine <@&${random}>, <@&${server.BotCommandRole}> rolü verildi.`,
			);
		msg.edit({
			content: `${member}, ${message.author} **Kişisi tarafından yetkili olmayı onaylıyor musunuz?**
\`Kullanıcıya yetki verildi.\`

#yetkili-kuralları okumayı unutmayın.`,
			components: [],
			embeds: [embed],
		});
		// 	} else if (interaction.customId === "hayır") {
		// 		msg.edit({
		// 			content: `${member}, ${message.author} **Kişisi tarafından yetkili olmayı onaylıyor musunuz?**
		// \`Kullanıcı işlemi reddetti.\``,
		// 			components: [],
		// 		});
		// 	}
		// });

		// collector.on("end", async (interaction) => {
		// 	msg.edit({
		// 		content: `${member}, ${message.author} **Kişisi tarafından yetkili olmayı onaylıyor musunuz?**
		// \`Süre dolduğu için işlem iptal edildi.\``,
		// 		components: [],
		// 	});
		// });
	},
};
