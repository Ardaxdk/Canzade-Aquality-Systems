const Discord = require("discord.js");
const moment = require("moment");

module.exports = async (message) => {
	if (message.author.bot) return;
	client.snipe.set(message.channel.id, message);
};

module.exports.conf = {
	name: "messageDelete",
};
