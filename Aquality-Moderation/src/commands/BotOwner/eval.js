const { inspect } = require("util");
const moment = require("moment");
require("moment-duration-format");
let serverSettings = require("../../models/serverSettings");

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
		if (message.author.bot) return;

		if (!args.length) {
			return message.reply({
				content:
					"Kodunuzu değerlendireceğim, lütfen bana bir kod verin.",
			});
		}

		try {
			const code = args.join(" ");
			let evaled = eval(code);

			if (typeof evaled !== "string") {
				evaled = inspect(evaled);
			}

			message.channel.send(clean(evaled), { code: "xl" });
		} catch (err) {
			message.channel.send(`\`Hata\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}
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
