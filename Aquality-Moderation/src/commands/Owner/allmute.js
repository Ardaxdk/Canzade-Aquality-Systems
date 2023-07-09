const Discord = require("discord.js");
const isimler = require("../../models/isimler.js");
const roller = require("../../models/rollog.js");
const mute = require("../../models/chatmute.js");
const notes = require("../../models/notlar.js");
const data = require("../../models/cezalar.js");
const uyarılar = require("../../models/uyar.js");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "allmute",
		usage: "allmute aç",
		category: "Owner",
		description: "Bulunduğunuz kanaldaki herkesi susturur.",
		aliases: ["allmute"],
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

		if (!message.member.voice.channel)
			return client.send(
				"Önce bir ses kanalına bağlı olmalısınız!",
				message.author,
				message.channel,
			);

		for (const member of message.member.voice.channel.members.values()) {
			if (args[0] === "aç") {
				member.voice.setMute(false);
			} else if (
				!member.user.bot &&
				!member.permissions.has(
					Discord.PermissionsBitField.Flags.ManageRoles,
				)
			) {
				member.voice.setMute(true);
			}
		}
		message.reply({ content: "işlem gerçekleştirildi." });
	},
};
