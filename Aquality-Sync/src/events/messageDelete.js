const Discord = require("discord.js");
const moment = require("moment");

module.exports = async (message) => {
	if (message.author.bot && message.author.id !== client.user.id) return;
	let embed = new Discord.EmbedBuilder()
		.setAuthor({
			name: message.author.username,
			iconURL: message.author.displayAvatarURL({ dynamic: true }),
		})
		.setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
		.setColor("Aqua")
		.setDescription(
			`
${message.author} <#${message.channel.id}> kanalında bir mesaj sildi.
\`\`\`

Silinen Mesaj: ${message.content}
Kanal: ${message.channel.name} - (${message.channel.id})
Kullanıcı: ${message.author.username} - (${message.author.id})
Mesaj ID: ${message.id}
Mesaj Tarihi: ${moment(Date.parse(new Date())).format("LLL")}
\`\`\``,
		);
	client.channels.cache
		.find((channel) => channel.name === "message-delete")
		.send({ embeds: [embed] });
};

module.exports.conf = {
	name: "messageDelete",
};
