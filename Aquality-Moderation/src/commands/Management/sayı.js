const Discord = require("discord.js");
const notlar = require("../../models/notlar.js");
const { max } = require("moment");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "Sayı",
		usage: "sayı [kelime]",
		category: "Management",
		description:
			"Belirttiğiniz kelimenin hangi üyelerin isminde olduğunu gösterir.",
		aliases: ["sayı", "names"],
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
		let includes = args[0];
		if (!includes)
			return client.send(
				"Lütfen bir kelime belirtip tekrar deneyin!",
				message.author,
				message.channel,
			);

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("Listele")
				.setLabel("Listele")
				.setEmoji("👌")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("CANCEL")
				.setLabel("İptal")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		if (
			message.guild.members.cache.filter((x) =>
				x.user.username.includes(includes),
			).size === 0
		)
			return client.send(
				"Kullanıcıların adında belirttiğiniz (`" +
					includes +
					"`) kelimesinden bulunamadı!",
				message.author,
				message.channel,
			);
		if (
			message.guild.members.cache.filter((x) =>
				x.user.username.includes(includes),
			).size > 500
		)
			return client.send(
				"Kullanıcı adında `" +
					includes +
					"` bulunan kişi sayısı 500 ü geçtiği için gönderemiyorum.",
				message.author,
				message.channel,
			);
		let msg = await message.channel.send({
			content: `Kullanıcı adında \`${includes}\` kelimesi geçen toplamda ${
				message.guild.members.cache.filter((x) =>
					x.user.username.includes(includes),
				).size
			} kadar kişi bulunmakta. Tüm üyeleri görüntülemek istiyorsanız 👌 emojisine tıklayınız.\n\nTepkisizlik dahilinde işlem 30 saniye içerisinde iptal edilecektir.`,
			components: [row],
		});
		var filter = (button) => button.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 30000,
		});

		collector.on("collect", async (button) => {
			if (button.customId === "Listele") {
				row.components[0].setDisabled(true);
				msg.edit({ components: [row] });

				let includesOne = 1;
				const throwns = `${client.users.cache
					.filter((x) =>
						x.tag.toLowerCase().includes(includes.toLowerCase()),
					)
					.map(
						(x) =>
							`**${includesOne++}.** <@${x.id}> - (\`${x.id}\`)`,
					)
					.join("\n")}`;
				button.reply({
					content: `Kullanıcı adında \`${includes}\` geçen kullanıcılar alt tarafta gösteriliyor.\n─────────────────\n ${throwns}`,
				});
			} else if (button.customId === "CANCEL") {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				msg.edit({ components: [row] });
				button.reply({ content: "İşlem iptal edildi" });
			}
		});
		collector.on("end", async (button, reason) => {
			row.components[0].setDisabled(true);
			row.components[1].setDisabled(true);
			msg.edit({ components: [row] });
		});
	},
};
