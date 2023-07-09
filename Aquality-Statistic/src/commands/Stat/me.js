const Discord = require("discord.js");
const ChannelModel = require("../../models/channelModel");
const VoiceModel = require("../../models/voiceModel");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
	conf: {
		name: "me",
		usage: ".me",
		category: "Global",
		description: "Ses ve mesaj verilerinizi görüntülersiniz.",
		aliases: ["me", "stat", "stats"],
	},

	async run(client, message, args) {
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;

		const channelData = await ChannelModel.find({
			userID: member.user.id,
			guildID: message.guild.id,
		});

		const voiceModel = await VoiceModel.findOne({
			userID: member.user.id,
			guildID: message.guild.id,
		});
		const voiceData = channelData
			.filter((data) => data.type === "GUILD_VOICE")
			.sort((a, c) => c.data - a.data)
			.slice(0, 10)
			.map((data, i) => {
				const channel = `${
					message.client.channels.cache.get(data.channelID)
						? message.client.channels.cache.get(data.channelID)
						: "Kanal silinmiş."
				}`;
				const formatted = client.ms(data.data);
				return `\`${i + 1}.\` ${channel}: \`${formatted.hours} saat, ${
					formatted.minutes
				} dk.\`\n`;
			});

		const formatted = client.ms(voiceModel.voice);
		const streamToplam = client.ms(voiceModel.streaming);
		const cameraToplam = client.ms(voiceModel.cam);

		const textData = channelData
			.filter((data) => data.type === "GUILD_TEXT")
			.sort((a, c) => c.data - a.data)
			.slice(0, 10)
			.map((data, i) => {
				const channel = `${
					message.client.channels.cache.get(data.channelID)
						? message.client.channels.cache.get(data.channelID)
						: "Kanal silinmiş."
				}`;

				return `\`${i + 1}.\` ${channel}: \`${data.data}\`\n`;
			});

		const parents = client.settings.PARENTS.map((parent) => {
			const points = channelData
				.filter((data) => {
					return (
						data.type === "GUILD_VOICE" &&
						message.client.channels.cache.get(data.channelID)
							.parentId === parent.id
					);
				})
				.reduce((acc, el) => acc + el.data, 0);

			const formatted = client.ms(points);
			return `\`•\` ${parent.name}: \`${formatted.hours} saat, ${formatted.minutes} dk.\``;
		});

		const channelstat = client.settings.CHANNELSTAT.map((channel) => {
			const points = channelData
				.filter((data) => {
					return data.type === "GUILD_VOICE" &&
						message.client.channels.cache.get(data.channelID)
						? message.client.channels.cache.get(data.channelID)
								.channelId === channel.id
						: "Kanal silinmiş.";
				})
				.reduce((acc, el) => acc + el.data, 0);
			const formatted = client.ms(points);
			return `\`•\` ${channel.name}: \`${formatted.hours} saat, ${formatted.minutes} dk.\`\n`;
		});
		const badge = client.settings.VOICE_REWARDS.find(
			(reward) => reward.rank <= voiceModel.voice,
		);

		const nextBadge = client.settings.VOICE_REWARDS.find(
			(reward) => reward.rank > voiceModel.voice,
		);
		const nextRequired = client.ms(
			(nextBadge?.rank || 0) - voiceModel.voice,
		);

		const badge2 = client.settings.TEXT_REWARDS.find(
			(reward) => reward.rank <= voiceModel.messages,
		);
		const nextBadge2 = client.settings.TEXT_REWARDS.find(
			(reward) => reward.rank > voiceModel.messages,
		);
		const nextRequired2 = (nextBadge2?.rank || 0) - voiceModel.messages;

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("category-info")
				.setDisabled(true)
				.setEmoji("📊")
				.setLabel("Kategori Bilgi")
				.setStyle(Discord.ButtonStyle.Secondary),
			new Discord.ButtonBuilder()
				.setCustomId("voice-info")
				.setEmoji("🎙️")
				.setLabel("Ses Sıralama")
				.setStyle(Discord.ButtonStyle.Secondary),
			new Discord.ButtonBuilder()
				.setCustomId("chat-info")
				.setEmoji("📋")
				.setLabel("Chat Sıralama")
				.setStyle(Discord.ButtonStyle.Secondary),
			new Discord.ButtonBuilder()
				.setCustomId("streamer-info")
				.setEmoji("🎥")
				.setLabel("Streamer Bilgi")
				.setStyle(Discord.ButtonStyle.Secondary),
		);
		const embed = new Discord.EmbedBuilder()
			.setColor("Aqua")
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setAuthor({
				name: member.user.username,
				iconURL: member.user.avatarURL({ dynamic: true }),
			})
			.setDescription(
				`
${member.toString()} (${member?.roles?.highest}) kişisinin sunucu verileri
`,
			)
			.addFields({
				name: "❯ Ses Rozet Durumu",
				value: `${
					badge
						? `Tebrikler, <@&${badge.role}> rozetine sahipsiniz.`
						: "Henüz bir rozetiniz bulunmamaktadır."
				} ${
					nextBadge
						? `Bir sonraki <@&${nextBadge.role}> rozeti elde etmek için public kanallarda \`${nextRequired.days} gün ${nextRequired.hours} saat ${nextRequired.minutes} dakika ${nextRequired.seconds} saniye\` daha geçirmen gerekiyor.`
						: "Tebrikler, tüm rozetleri kazandınız!"
				}`,
			})
			.addFields({
				name: "❯ Kategori Bilgileri",
				value: `\`•\` Toplam: \`${formatted.hours} saat, ${
					formatted.minutes
				} dk.\`
            ${parents.join("\n")}
            ${channelstat.join("\n")}
`,
			})

			.addFields({
				name: "❯ Mesaj Rozet Durumu",
				value: `${
					badge2
						? `Tebrikler, <@&${badge2.role}> rozetine sahipsiniz.`
						: "Henüz bir rozetiniz bulunmamaktadır."
				} ${
					nextBadge2
						? `Bir sonraki <@&${nextBadge2.role}> rozeti elde etmek için text kanallarda \`${nextRequired2}\` daha mesaj atman gerekiyor.`
						: "Tebrikler, tüm rozetleri kazandınız!"
				}`,
			})
			.setFooter({ text: "30 günlük veriler listelendi." });

		let msg = await message.reply({ embeds: [embed], components: [row] });

		var filter = (interaction) => interaction.user.id === member.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 60000,
		});

		collector.on("collect", async (interaction) => {
			let embed = new Discord.EmbedBuilder()
				.setColor("Aqua")
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.setAuthor({
					name: member.user.username,
					iconURL: member.user.avatarURL({ dynamic: true }),
				})
				.setDescription(
					`
${member.toString()} (${member?.roles?.highest}) kişisinin sunucu verileri
`,
				)

				.setFooter({ text: "30 günlük veriler listelendi." });
			if (interaction.customId === "category-info") {
				interaction.deferUpdate();
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(false);
				row.components[2].setDisabled(false);
				row.components[3].setDisabled(false);
				embed.addFields({
					name: "❯ Kategori Bilgileri",
					value: `\`•\` Toplam: \`${formatted.hours} saat, ${
						formatted.minutes
					} dk.\`
            ${parents.join("\n")}
            ${channelstat.join("\n")}
`,
				});

				msg.edit({ embeds: [embed], components: [row] });
			}
			if (interaction.customId === "voice-info") {
				interaction.deferUpdate();
				row.components[0].setDisabled(false);
				row.components[1].setDisabled(true);
				row.components[2].setDisabled(false);
				row.components[3].setDisabled(false);
				embed.addFields({
					name: `❯ Ses Kanalı Sıralaması (${
						voiceData.length ?? 0
					} kanalda bulunmuş)`,
					value: `${
						voiceData.length
							? voiceData.join("")
							: "Ses Veriniz Bulunmamaktadır."
					}`,
				});

				msg.edit({ embeds: [embed], components: [row] });
			}
			if (interaction.customId === "chat-info") {
				interaction.deferUpdate();
				row.components[0].setDisabled(false);
				row.components[1].setDisabled(false);
				row.components[2].setDisabled(true);
				row.components[3].setDisabled(false);
				embed.addFields({
					name: `❯ Mesaj Kanalı Sıralaması (Toplam: ${voiceModel.messages})`,
					value: `${
						textData.length
							? textData.join("")
							: "Mesaj Veriniz Bulunmamaktadır."
					}`,
				});

				msg.edit({ embeds: [embed], components: [row] });
			}
			if (interaction.customId === "streamer-info") {
				interaction.deferUpdate();
				row.components[0].setDisabled(false);
				row.components[1].setDisabled(false);
				row.components[2].setDisabled(false);
				row.components[3].setDisabled(true);
				embed.addFields({
					name: `❯ Streamer`,
					value: `
\`•\` Yayında geçirdiği süre: \`${streamToplam.hours} saat, ${streamToplam.minutes} dk.\`
\`•\` Kamerada geçirdiği süre: \`${cameraToplam.hours} saat, ${cameraToplam.minutes} dk.\`
`,
				});

				msg.edit({ embeds: [embed], components: [row] });
			}
		});

		collector.on("end", async (interaction) => {
			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setCustomId("buttonend-stat")
					.setDisabled(true)
					.setEmoji("⏱️")
					.setLabel("Mesajın Geçerlilik Süresi Doldu.")
					.setStyle(Discord.ButtonStyle.Danger),
			);
			msg.edit({ components: [row] });
		});
	},
};
