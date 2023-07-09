const data = require("../../models/cezalar.js");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
const Discord = require("discord.js");
moment.locale("tr");
const voicemute = require("../../models/voicemute.js");
let serverSettings = require("../../models/serverSettings");
const chatmute = require("../../models/chatmute.js");
const wmute = require("../../models/waitMute.js");
module.exports = {
	conf: {
		name: "unmute",
		usage: "unmute [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişinin mutesini kaldırırsınız.",
		aliases: ["unmute", "unvmute", "vunmute", "unmutes"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});

		if (
			!message.member.roles.cache.some((r) =>
				server.ChatMuteAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let target =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!target)
			return message.reply({
				content: "Lütfen bir kullanıcı belirleyiniz",
			});

		await data
			.find({ user: target.id })
			.sort({ ihlal: "descending" })
			.exec(async (err, res) => {
				if (!res)
					return client.send(
						`${target} kullanıcısının ceza bilgisi bulunmuyor.`,
						message.author,
						message.channel,
					);

				let cezasayı = await client.cezasayı(target.id);
				let puan = await client.punishPoint(target.id);
				let durum;
				if (cezasayı < 5) durum = "Çok Güvenli";
				if (cezasayı >= 5 && cezasayı < 10) durum = "Güvenli";
				if (cezasayı >= 10 && cezasayı < 15) durum = "Şüpheli";
				if (cezasayı >= 15 && cezasayı < 20) durum = "Tehlikeli";
				if (cezasayı >= 20) durum = "Çok Tehlikeli";

				const embed = new Discord.EmbedBuilder()
					.setAuthor({
						name: target.user.username,
						iconURL: target.user.avatarURL({ dynamic: true }),
					})
					.setDescription(
						`${target} üyesinin kaldırmak istediğiniz voice-chat mute ceza türünü aşağıdaki buttonlardan seçiniz!`,
					)
					.setFooter({
						text: "Üyenin ceza puanı " + puan + " (" + durum + ")",
					})
					.setColor("Random");

				const row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
						.setCustomId("ChatMute")
						.setLabel("Chat Mute")
						.setStyle(Discord.ButtonStyle.Primary),
					new Discord.ButtonBuilder()
						.setCustomId("VoiceMute")
						.setLabel("Voice Mute")
						.setStyle(Discord.ButtonStyle.Primary),
					new Discord.ButtonBuilder()
						.setCustomId("CANCEL")
						.setLabel("İptal")
						.setStyle(Discord.ButtonStyle.Danger),
				);

				let msg = await message.channel.send({
					components: [row],
					embeds: [embed],
				});

				var filter = (button) => button.user.id === message.author.id;
				const collector = msg.createMessageComponentCollector({
					filter,
					time: 30000,
				});

				collector.on("end", async (button, reason) => {
					row.components[0].setDisabled(true);
					row.components[1].setDisabled(true);
					row.components[2].setDisabled(true);
					msg.edit({ components: [row] });
				});

				collector.on("collect", async (button, user) => {
					if (button.customId === "ChatMute") {
						row.components[0].setDisabled(true);
						msg.edit({ components: [row] });

						chatmute.deleteOne({ user: target.id }, async (err) => {
							if (err) {
								console.log("Silinemedi.");
							}
						});
						await target.roles
							.remove(server.ChatMuteRole)
							.then(async (user) => {
								button.reply({
									content: `Başarılı bir şekilde <@${user.id}> adlı kullanıcının mutesini kaldırdınız.`,
									ephemeral: true,
								});
							});
					} else if (button.customId === "VoiceMute") {
						row.components[1].setDisabled(true);
						msg.edit({ components: [row] });

						if (!target.voice.channel)
							return button.reply({
								content: "Kullanıcı ses kanalına bağlı değil!",
								ephemeral: true,
							});

						voicemute.deleteOne(
							{ user: target.id },
							async (err) => {
								if (err) {
									console.log("Silinemedi.");
								}
							},
						);
						button.reply({
							content: `Başarılı bir şekilde <@${target.id}> adlı kullanıcının ses mutesini kaldırdınız.`,
							ephemeral: true,
						});
						target.voice.setMute(false);
					} else if (button.customId === "CANCEL") {
						row.components[0].setDisabled(true);
						row.components[1].setDisabled(true);
						row.components[2].setDisabled(true);
						msg.edit({ components: [row] });
						button.reply({
							content: `İşlem iptal edildi.`,
							ephemeral: true,
						});
					}
				});
			});
	},
};
