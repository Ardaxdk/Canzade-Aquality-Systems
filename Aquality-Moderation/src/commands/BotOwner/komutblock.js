let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "uncmd",
		usage: "uncmd [@user]",
		category: "BotOwner",
		description: "Belirttiğiniz kullanıcının komut bloğunu kaldırır.",
		aliases: ["uncmd"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!server.BotOwner.includes(message.author.id) &&
			!server.GuildOwner.includes(message.author.id)
		)
			return;
		let victim =
			message.mentions.members.first() ||
			(await client.üye(args[0], message.guild));
		if (!victim)
			return client.send(
				"Komut yasağını kaldırmak istediğin kullanıcıyı doğru şekilde belirt ve tekrar dene!",
				message.author,
				message.channel,
			);
		if (!client.blockedFromCommand.includes(victim.id))
			return message.channel.send({
				content: `${client.emojis.cache.find(
					(x) => x.name === client.settings.emojis.no_name,
				)} **${
					victim.user.username
				}** kullanıcısı komut yasaklaması listesinde bulunmuyor.`,
			});
		let cleanArray = client.blockedFromCommand.find((x) => x === victim.id);
		client.blockedFromCommand.splice(
			client.blockedFromCommand.indexOf(cleanArray),
			1,
		);
		message.channel.send({
			content: `${client.emojis.cache.find(
				(x) => x.name === client.settings.emojis.yes_name,
			)} **${
				victim.user.username
			}** kullanıcısının komut yasağı kaldırıldı.`,
		});
	},
};
