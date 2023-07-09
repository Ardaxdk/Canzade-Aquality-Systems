const moment = require("moment");
require("moment-duration-format");
const cezalar = require("../../models/cezalar.js");
const Discord = require("discord.js");
const sunucu = require("../../models/sunucu-bilgi.js");
module.exports = {
	conf: {
		name: "temizle",
		usage: "temizle [sayı]",
		category: "Management",
		description: "Belirttiğiniz miktarda mesajı kanaldan siler.",
		aliases: ["sil", "clear"],
	},

	async run(client, message, args) {
		if (
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			)
		)
			return;
		let amount = args[0];
		if (!amount || isNaN(amount) || parseInt(amount) < 1) {
			return client.send(
				"Silinecek mesaj sayısını belirtmelisin.",
				message.author,
				message.channel,
			);
		}

		await message.delete();
		const user = message.mentions.users.first();

		let messages = await message.channel.messages.fetch({ limit: 100 });
		messages = [...messages.values()];
		if (user) {
			messages = messages.filter((m) => m.author.id === user.id);
		}
		if (messages.length > amount) {
			messages.length = parseInt(amount, 10);
		}
		messages = messages.filter((m) => !m.pinned);
		amount++;
		message.channel.bulkDelete(messages, true);
		if (user) {
			client.send(
				`${user} kişisinin **${messages.length}** mesajı sildi.`,
				message.author,
				message.channel,
			);
		} else {
			client.send(
				`**${messages.length}** mesaj silindi.`,
				message.author,
				message.channel,
			);
		}
	},
};
