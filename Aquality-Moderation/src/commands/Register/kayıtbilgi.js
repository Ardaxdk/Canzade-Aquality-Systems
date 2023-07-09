const Discord = require("discord.js");
const kayıtlar = require("../../models/kayıtlar.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "kayıt-bilgi",
		usage: "kayıtlar [@user]",
		category: "Register",
		description:
			"Belirttiğiniz kişinin yapmış olduğu kayıt bilgilerini görüntülersiniz.",
		aliases: ["kayıtbilgi", "kayıtlar", "kayıtlarım"],
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
		let user =
			message.mentions.members.first() ||
			(await client.üye(args[0], message.guild)) ||
			message.member;
		await kayıtlar.findOne({ user: user.id }, async (err, res) => {
			if (!res)
				return client.send(
					"<@" + user.id + "> kişisinin hiç kayıt bilgisi yok.",
					message.author,
					message.channel,
				);
			let üyeler = await client.shuffle(
				res.kayıtlar.map((x) => "<@" + x + ">"),
			);
			if (üyeler.length > 10) üyeler.length = 10;
			client.send(
				"<@" +
					user.id +
					"> kişisi toplam " +
					res.toplam +
					" kayıt (**" +
					res.erkek +
					"** erkek, **" +
					res.kadın +
					"** kadın) uygulamış.\nKaydettiği bazı kişiler: " +
					üyeler.join(",") +
					" ",
				user.user,
				message.channel,
			);
		});
	},
};
