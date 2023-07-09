const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
const notlar = require("../../models/notlar.js");
module.exports = {
	conf: {
		name: "Not",
		usage: "not [@user] [not]",
		category: "Authorized",
		description: "Belirttiğiniz kişiye not bırakırsınız.",
		aliases: ["not"],
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
				"Not bırakmak istediğin kullanıcıyı düzgünce belirt ve tekrar dene !",
				message.author,
				message.channel,
			);
		if (
			message.member.roles.highest.rawPosition <
			user.roles.highest.rawPosition
		)
			return client.send(
				"Ceza notu bırakmak istediğiniz kişinin rolleri sizden yüksekte!",
				message.author,
				message.channel,
			);
		if (user.id == message.author.id)
			return client.send(
				"Kendi kendine ceza notu bırakamazsın!",
				message.author,
				message.channel,
			);
		await notlar.findOne({ user: user.id }, async (err, res) => {
			if (!args.slice(1).join(" "))
				return client.send(
					"Kişiye bırakmak istediğin notu yaz ve tekrar dene !",
					message.author,
					message.channel,
				);
			if (!res) {
				let arr = [];
				arr.push({
					not: args.slice(1).join(" "),
					yetkili: message.author.id,
				});
				const newData = new notlar({
					user: user.id,
					notlar: arr,
				});
				await newData.save().catch((e) => console.log(e));
				client.send(
					`<@${
						user.id
					}> kişisine başarıyla not bırakıldı.\n\n:no_entry_sign: Bırakılan ceza notu: **${args
						.slice(1)
						.join(" ")}**`,
					message.author,
					message.channel,
				);
			} else {
				res.notlar.push({
					not: args.slice(1).join(" "),
					yetkili: message.author.id,
					tarih: Date.now(),
				});
				await res.save().catch((e) => console.log(e));
				client.send(
					`<@${
						user.id
					}> kişisine başarıyla not bırakıldı.\n\n:no_entry_sign: Bırakılan ceza notu: **${args
						.slice(1)
						.join(" ")}**`,
					message.author,
					message.channel,
				);
			}
		});
	},
};
