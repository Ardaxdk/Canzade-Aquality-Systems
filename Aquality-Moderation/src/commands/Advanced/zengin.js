const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "booster-nick",
		usage: "zengin [@isim][yaş]",
		category: "Global",
		description:
			"Boosterlar sunucu isimlerini bu komut ile değiştirebilir.",
		aliases: ["bisim", "b-isim", "zengin", "booster", "b"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.BoosterRole.includes(r.id),
			)
		)
			return;
		let isim = args.slice().join(" ");
		if (!isim)
			return client.send(
				"Bir isim belirtmelisin.",
				message.author,
				message.channel,
			);
		let olmaz = /([^a-zA-ZIıİiÜüĞğŞşÖöÇç0-9 ]+)/gi;
		if (isim && (await client.chatKoruma(isim)))
			return client.send(
				"Kullanıcı adına reklam veya küfür yazamazsın.",
				message.author,
				message.channel,
			);
		if (isim.match(olmaz))
			return client.send(
				"Belirttiğin kullanıcı adında özel harfler bulunmaması gerekir lütfen tekrar dene!",
				message.author,
				message.channel,
			);
		let banNum = client.boosterLimit.get(message.author.id) || 0;
		client.boosterLimit.set(message.author.id, banNum + 1);
		if (banNum == 3)
			return client.send(
				"Günde sadece 3 kez isim değiştirebilirsin.",
				message.author,
				message.channel,
			);
		try {
			const nicks = message.member.user.username.includes(server.Tag);
			if (nicks)
				await message.member.setNickname(`${server.Tag} ${isim}`);
			else
				await message.member.setNickname(
					`${server.SecondaryTag} ${isim}`,
				);
			client.send(
				`Kullanıcı adını başarıyla **${message.member.displayName}** olarak ayarladım.`,
				message.author,
				message.channel,
			);
		} catch (error) {
			client.send(
				"Bir hata ile karşılaştım | **" + error + "**",
				message.author,
				message.channel,
			);
		}
	},
};
