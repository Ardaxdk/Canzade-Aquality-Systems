const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "Taşı",
		usage: "taşı [@üye] [#kanalID]",
		category: "Management",
		description: "Belirttiğiniz üyeyi belirttiğiniz kanala taşırsınız.",
		aliases: ["taşı", "gönder", "yolla"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.MoveAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let user =
			message.mentions.members.first() ||
			(await client.üye(args[0], message.guild));
		let yollanılıcak = client.channels.cache.find(
			(c) => c.id === args.slice(1).join(" "),
		);
		if (!user)
			return client.send(
				"Taşımak istediğiniz kişiyi düzgünce belirtin ve tekrar deneyin!",
				message.author,
				message.channel,
			);
		if (!args.slice(1).join(" "))
			return client.send(
				"Kişiyi göndermek istediğiniz kanalın argümanlarını doğru bir şekilde yerleştirin!",
				message.author,
				message.channel,
			);
		if (!yollanılıcak)
			return client.send(
				"Kişiyi göndermek istediğiniz kanalın idsi hatalı!",
				message.author,
				message.channel,
			);
		if (!user.voice.channel)
			return client.send(
				"Belirttiğiniz kişi sunucumuzda ses kanallarında bulunmuyor!",
				message.author,
				message.channel,
			);
		if (
			message.member.roles.highest.rawPosition <
			user.roles.highest.rawPosition
		)
			return client.send(
				"Rolleri senden yüksek birisini kanallar arasında taşıyamazsın!",
				message.author,
				message.channel,
			);
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(
				"<@" +
					user +
					"> adlı kullanıcıyı başarıyla `" +
					yollanılıcak.name +
					"` adlı ses kanalına yolladınız.",
			)
			.setColor("Random");
		user.voice.setChannel(yollanılıcak);
		message.channel
			.send({ embeds: [embed] })
			.then((message) => {
				setTimeout(() => {
					message.delete();
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
