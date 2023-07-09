const Discord = require("discord.js");
const moment = require("moment");
let serverSettings = require("../../models/serverSettings");
require("moment-duration-format");
moment.locale("tr");
module.exports = {
	conf: {
		name: "tag",
		usage: "tag",
		category: "Global",
		description: "Sunucunun tagını görüntülersiniz.",
		aliases: ["tag"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		message.channel.send({ content: server.Tag });
	},
};
