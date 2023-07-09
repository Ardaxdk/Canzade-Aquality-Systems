const Discord = require("discord.js");
const cezalar = require("../../models/cezalı.js");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
	conf: {
		name: "af",
		usage: "unjail [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişiyi cezalıdan çıkartırsınız.",
		aliases: ["unslave", "cezalı-af", "unjail"],
	},
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
		let user =
			message.mentions.members.first() ||
			(await client.üye(args[0], message.guild));
		if (!user)
			return client.send(
				"Cezalısını kaldırmak istediğin kullanıcıyı belirt.",
				message.author,
				message.channel,
			);
		await cezalar.findOne({ user: user.id }, async (err, doc) => {
			if (!doc)
				return client.send(
					"<@" + user + "> veritabanında cezalı olarak bulunmuyor.",
					message.author,
					message.channel,
				);
			if (doc.ceza == false)
				return client.send(
					"<@" + user + "> veritabanında cezalı olarak bulunmuyor.",
					message.author,
					message.channel,
				);
			doc.delete().catch((e) => console.log(e));
			user.roles.cache.has(server.BoosterRole)
				? user.roles.set([
						server.BoosterRole,
						server.UnregisteredRole[0],
				  ])
				: user.roles.set(server.UnregisteredRole);
			client.send(
				"Veritabanındaki <@" + user + "> kişinin cezası kaldırıldı.",
				message.author,
				message.channel,
			);
		});
	},
};
