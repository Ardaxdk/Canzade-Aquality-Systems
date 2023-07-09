const { inspect } = require("util");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
	conf: {
		name: "eval",
		usage: "eval <code>",
		category: "BotOwner",
		description: "Kodlarınızı denemenizi sağlar.",
		aliases: ["ev"],
	},

	async run(client, message, args) {
		if (!client.settings.BOT_OWNERS.includes(message.author.id)) return;
	},
};

function clean(text) {
	if (typeof text === "string") {
		return text
			.replace(/`/g, "`" + String.fromCharCode(8203))
			.replace(/@/g, "@" + String.fromCharCode(8203));
	} else {
		return text;
	}
}
