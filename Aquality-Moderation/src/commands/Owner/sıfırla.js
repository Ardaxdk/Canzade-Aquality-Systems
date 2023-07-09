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
		name: "sıfırla",
		usage: "sıfırla [@user]",
		category: "Owner",
		description:
			"Belirttiğiniz kullanıcının data verilerini sıfırlamaya yarar.",
		aliases: ["sıfırla"],
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
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!member)
			return client.send(
				"Bir kullanıcı belirtmelisin.",
				message.author,
				message.channel,
			);

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("registersıfırla")
				.setLabel("Kayıt Verileri")
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId("penaltiessıfırla")
				.setLabel("Cezalar")
				.setStyle(Discord.ButtonStyle.Secondary),
			new Discord.ButtonBuilder()
				.setCustomId("uyarısıfırla")
				.setLabel("Uyarılar")
				.setStyle(Discord.ButtonStyle.Secondary),
			new Discord.ButtonBuilder()
				.setCustomId("notlarsıfırla")
				.setLabel("Notlar")
				.setStyle(Discord.ButtonStyle.Success),
			new Discord.ButtonBuilder()
				.setCustomId("rollogsıfırla")
				.setLabel("Rol verileri")
				.setStyle(Discord.ButtonStyle.Primary),
		);
		const row2 = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("CANCEL")
				.setLabel("İptal")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Random")
			.setDescription(`${message.author} Merhaba! Bu panel kullanıcının veritabanında bulunan verilerini silmeye yarar! ${member} kullanıcısının hangi verilerini silmek istiyorsan o buttona tıklaman yeterli.
\`\`\`diff
- Kayıt verileri (İsimler)
- Cezalar (Ceza Puan, Chat-Voice Mute, Cezalı, Ban)
- Uyarılar (Kullanıcıya verilen uyarılar)
- Notlar (Yetkililer tarafından bırakılan notlar)
- Rol Verileri (Kullanıcıya bot veya sağ tık ile verilmiş, alınmış tüm loglanmış roller) \`\`\`
Bu işlemi sadece bot sahipleri gerçekleştirebilir.
   `);

		let msg = await message.channel.send({
			embeds: [embed],
			components: [row, row2],
		});

		var filter = (button) => button.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 60000,
		});

		collector.on("collect", async (button) => {
			if (button.customId === "registersıfırla") {
				row.components[0].setDisabled(true);
				msg.edit({ components: [row, row2] });
				await isimler.deleteMany({ user: member.user.id });
				button.reply({content:
					`${member} kullanıcısının kayıt verileri sıfırlandı!`,
			});
			} else if (button.customId === "penaltiessıfırla") {
				row.components[1].setDisabled(true);
				msg.edit({ components: [row, row2] });
				await data.deleteMany({ user: member.user.id });
				await mute.deleteMany({ user: member.user.id });
				button.reply({content:
					`${member} kullanıcısının ceza verileri sıfırlandı!`,
			});
			} else if (button.customId === "uyarısıfırla") {
				row.components[2].setDisabled(true);
				msg.edit({ components: [row, row2] });
				await uyarılar.deleteMany({ user: member.user.id });
				button.reply({content:
					`${member} kullanıcısının uyarı verileri sıfırlandı!`,
			});
			} else if (button.customId === "notlarsıfırla") {
				row.components[3].setDisabled(true);
				msg.edit({ components: [row, row2] });
				await notes.deleteMany({ user: member.user.id });
				button.reply({content:
					`${member} kullanıcısının not verileri sıfırlandı!`,
			});
			} else if (button.customId === "rollogsıfırla") {
				row.components[4].setDisabled(true);
				msg.edit({ components: [row, row2] });
				await roller.deleteMany({ user: member.user.id });
				button.reply({content:
					`${member} kullanıcısının rol verileri sıfırlandı!`,
			});
			} else if (button.customId === "CANCEL") {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				row.components[2].setDisabled(true);
				row.components[3].setDisabled(true);
				row.components[4].setDisabled(true);
				row2.components[0].setDisabled(true);

				msg.edit({ components: [row, row2] });

				button.reply({content:`İşlem iptal edildi!`});
			}
		});

		collector.on("end", async (button) => {
			row.components[0].setDisabled(true);
			row.components[1].setDisabled(true);
			row.components[2].setDisabled(true);
			row.components[3].setDisabled(true);
			row.components[4].setDisabled(true);
			row2.components[0].setDisabled(true);
			msg.edit({ components: [row, row2] });
		});
	},
};
