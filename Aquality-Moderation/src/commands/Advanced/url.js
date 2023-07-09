const Discord = require("discord.js");
const moment = require("moment");
let serverSettings = require("../../models/serverSettings");
require("moment-duration-format");
moment.locale("tr");
module.exports = {
	conf: {
		name: "url",
		usage: "url",
		category: "Global",
		description: "Sunucunun urlsini ve kullanım sayısını görüntülersiniz",
		aliases: ["url"],
	},

	async run(client, message, args) {
		if (!message.guild.vanityURLCode)
			return message.reply({
				content: "Bu sunucunun bir özel urlsi yok.",
			});

		const link = await message.guild.fetchVanityData();

		message.reply({
			content: `discord.gg/${message.guild.vanityURLCode}\n**Url Kullanımı:** **${link.uses}**`,
		});
	},
};
