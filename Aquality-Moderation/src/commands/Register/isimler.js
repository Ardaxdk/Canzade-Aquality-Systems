const Discord = require("discord.js");
const isimler = require("../../models/isimler.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "isimler",
		usage: "isimler [@user]",
		category: "Register",
		description:
			"Belirttiğiniz kişinin datadaki isimlerini görüntülersiniz.",
		aliases: ["isimler"],
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
				"Geçmiş isimlerine bakmak istediğin kullanıcıyı belirtmen gerekiyor!",
				message.author,
				message.channel,
			);
		isimler.findOne({ user: user.id }, async (err, res) => {
			if (!res)
				return client.send(
					"Bu üyenin geçmiş isimleri bulunamadı.",
					message.author,
					message.channel,
				);
			const zaa = new Discord.EmbedBuilder()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL({ dynamic: true }),
				})
				.setDescription(
					`
Bu üyenin toplam da ${res.isimler.length} isim kayıtı bulundu:
          
${res.isimler.map((x) => `\`• ${x.isim}\` (${x.state})`).join("\n")}`,
				)
				.setColor("Random");
			message.channel
				.send({ embeds: [zaa] })
				.then((message) => {
					setTimeout(() => {
						message.delete();
					}, 10000);
				})
				.then((m) =>
					message.react(
						client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.yes_name,
						),
					),
				);
		});
	}, //(${x.yetkili.replace(message.author.id, `<@${x.yetkili}>`).replace(`Yok`,`Yok`)})
};
