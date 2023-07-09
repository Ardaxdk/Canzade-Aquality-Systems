const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "ses",
		usage: "n [@user]",
		category: "Management",
		description: "Belirttiğiniz üyenin ses bilgisini gösterir.",
		aliases: ["n", "nerde", "nerede"],
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
		if (!user)
			return client.send(
				"Ses bilgisine bakmak istediğin kullanıcıyı düzgünce belirt ve tekrar dene!",
				message.author,
				message.channel,
			);
		let status = user.presence.status
			.replace(
				"online",
				client.emojis.cache.find(
					(x) => x.name === client.settings.emojis.online_name,
				),
			)
			.replace(
				"idle",
				client.emojis.cache.find(
					(x) => x.name === client.settings.emojis.idle_name,
				),
			)
			.replace(
				"dnd",
				client.emojis.cache.find(
					(x) => x.name === client.settings.emojis.dnd_name,
				),
			)
			.replace(
				"offline",
				client.emojis.cache.find(
					(x) => x.name === client.settings.emojis.offline_name,
				),
			);
		if (!user.voice.channel)
			return message.reply({
				embeds: [
					new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setDescription(
							`${status} ${user} bir ses kanalına bağlı değil.`,
						),
				],
			});
		let mic =
			user.voice.selfMute == true
				? client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.mic_name,
				  )
				: "";
		let kulaklik =
			user.voice.selfDeaf == true
				? client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.kulaklik_name,
				  )
				: "";
		let txt = "";
		if (client.channelTime.has(user.id)) {
			let süresi = client.channelTime.get(user.id);
			txt += await client.turkishDate(Date.now() - süresi.time);
		} else {
			txt += "Kullanıcının ses süresi bilgisi yok.";
		}

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Random").setDescription(`
\`••❯\` ${user.voice.channel} 
${status} ${user} ${mic} ${kulaklik} 
Bu kanalda **${txt}** geçirmiş.`);

		message.reply({ embeds: [embed] });
	},
};
