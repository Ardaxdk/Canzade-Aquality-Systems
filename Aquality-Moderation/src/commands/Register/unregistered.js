const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "Unregister",
		usage: "unregister [@user]",
		category: "Register",
		description: "Belirttiğiniz kişiyi kayıtsıza atarsınız.",
		aliases: [
			"unregister",
			"kayıtsız",
			"un-register",
			"unreg",
			"unregistered",
		],
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
			(await client.üye(args[0], message.guild));
		if (!user)
			return client.send(
				"Kayıtsıza atmak istediğiniz kişiye belirtmeniz gerekmektedir.",
				message.author,
				message.channel,
			);
		if (
			user.permissions.has(Discord.PermissionsBitField.Flags.ViewAuditLog)
		)
			return client.send(
				"Sunucumuzda yönetici olarak bulunan kişileri kayıtsıza atamazsınız.",
				message.author,
				message.channel,
			);
		if (
			user.roles.cache.has(server.BotCommandRole) ||
			user.roles.cache.has(server.BoosterRole)
		)
			return client.send(
				"Sunucumuzda yetkili olarak bulunan ve ya sunucumuza takviye yapmış üyeleri kayıtsıza atamam.",
				message.author,
				message.channel,
			);
		let banNum = client.unregisterLimit.get(message.author.id) || 0;
		client.unregisterLimit.set(message.author.id, banNum + 1);
		if (banNum == 5)
			return client.send(
				"Gün içerisinde çok fazla kayıtsız işlemi uyguladığınız için komut geçici olarak kullanımınıza kapatılmıştır.",
				message.author,
				message.channel,
			);
		user.roles.cache.has(server.BoosterRole)
			? user.roles.set([server.BoosterRole, server.UnregisteredRole[0]])
			: user.roles.set([server.UnregisteredRole[0]]);
		if (user.voice.channel) return user.voice.disconnect();
		const görüşürüz = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(
				"<@" +
					user +
					"> adlı kullanıcı sunucumuzda başarıyla kayıtsıza atılmıştır.",
			)
			.setColor(message.member.displayHexColor);
		message.channel
			.send({ embeds: [görüşürüz] })
			.then((msg) => {
				setTimeout(() => {
					msg.delete();
				}, 5000);
			})
			.then((m) =>
				message.react(
					client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.yes_name,
					),
				),
			);
	},
};
