const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "Say",
		usage: "say",
		category: "Management",
		description: "Sunucu detaylarını gösterir.",
		aliases: ["say"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			)
		)
			return;
		let tag = client.users.cache.filter((x) =>
			x.username.includes(server.Tag),
		).size;
		let ses = message.guild.channels.cache
			.filter((channel) => channel.type == Discord.ChannelType.GuildVoice)
			.map(
				(channel) =>
					channel.members.filter((member) => !member.user.bot).size,
			)
			.reduce((a, b) => a + b);
		let bot = message.guild.channels.cache
			.filter((channel) => channel.type == Discord.ChannelType.GuildVoice)
			.map(
				(channel) =>
					channel.members.filter((member) => member.user.bot).size,
			)
			.reduce((a, b) => a + b);
		let members = message.guild.members.cache.size;
		let boost =
			message.guild.premiumSubscriptionCount ||
			"Sunucuda boost takviyesi bulunmamakta.";
		let online = message.guild.members.cache.filter(
			(m) => m.presence && m.presence.status !== "offline",
		).size;

		let embed = new Discord.EmbedBuilder()
			.setColor("Random")
			.setDescription(
				"`•` Seste toplam **" +
					ses +
					"** kullanıcı var.\n`•` Sunucumuzda toplam **" +
					members +
					"** üye var.\n`•` Sunucumuzda toplam **" +
					online +
					"** çevrim içi üye var.\n`•` Toplam **" +
					tag +
					"** kişi tagımıza sahip.",
			);

		message.reply({ embeds: [embed] });
	},
};
