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
		name: "emojiekle",
		usage: "emoji :emoji: [emoji isim]",
		category: "Owner",
		description: "Belirttiğiniz emojiyi sunucuya ekler.",
		aliases: ["emoji", "emojiekle"],
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

		let emoji = args[0];
		let emojiName = args[1];

		if (!emoji)
			return message.reply({ content: "Bir emoji belirtmelisin." });

		const parsedEmoji = parseEmoji(emoji);

		if (parsedEmoji.id) {
			const link = `https://cdn.discordapp.com/emojis/${parsedEmoji.id}.${
				parsedEmoji.animated ? `gif` : "png"
			}`;

			const createdEmoji = await message.guild.emojis.create({
				attachment: link,
				name: emojiName || parsedEmoji.name,
			});

			message.reply({
				content: `Başarıyla ${createdEmoji} (${
					emojiName || parsedEmoji.name
				}) emojisi sunucuya eklendi.`,
			});
		} else message.reply({ content: "emoji bulunamadı." });
	},
};

function parseEmoji(text) {
	if (text.includes("%")) text = decodeURIComponent(text);
	if (!text.includes(":"))
		return { animated: false, name: text, id: undefined };
	const match = text.match(/<?(?:(a):)?(\w{1,32}):(\d{17,19})?>?/);
	return (
		match && {
			animated: Boolean(match[1]),
			name: match[2],
			id: match[3],
		}
	);
}
