const Discord = require("discord.js");
const ChannelModel = require("../../models/channelModel");
const VoiceModel = require("../../models/voiceModel");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
	conf: {
		name: "yedek",
		usage: ".yedek",
		category: "Global",
		description: "Ses ve mesaj verilerinizi görüntülersiniz.",
		aliases: ["yedek"],
	},

	async run(client, message, args) {
		/*	const member =
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
				return `\`${i + 1}.\` ${channel}: \`${formatted.days} gün ${
					formatted.hours
				} saat ${formatted.minutes} dakika ${
					formatted.seconds
				} saniye\`\n`;
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
			return `\`•\` ${parent.name}: \`${formatted.days} gün ${formatted.hours} saat ${formatted.minutes} dakika ${formatted.seconds} saniye\``;
		});

		const channelstat = client.settings.CHANNELSTAT.map((channel) => {
			const points = channelData
				.filter((data) => {
					return data.type === "GUILD_VOICE" &&
						message.client.channels.cache.get(data.channelID)
						? message.client.channels.cache.get(data.channelID)
						: "Kanal silinmiş.";
				})
				.reduce((acc, el) => acc + el.data, 0);
			const formatted = client.ms(points);
			return `\`•\` ${channel.name}: \`${formatted.days} gün ${formatted.hours} saat ${formatted.minutes} dakika ${formatted.seconds} saniye\`\n`;
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
				name: "❯ Kanal Bilgileri",
				value: ` \`•\` Toplam: \`${formatted.days} gün ${
					formatted.hours
				} saat ${formatted.minutes} dakika ${formatted.seconds} saniye\`
            ${parents.join("\n")}
            ${channelstat.join("\n")}

                   `,
			})
			.addFields({
				name: `❯ Kanal Sıralaması (${
					voiceData.length ?? 0
				} kanalda bulunmuş)`,
				value: `${
					voiceData.length
						? voiceData.join("")
						: "Ses Veriniz Bulunmamaktadır."
				}
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
			.addFields({
				name: `❯ Kanal Sıralaması (Toplam: ${voiceModel.messages})`,
				value: `${
					textData.length
						? textData.join("")
						: "Mesaj Veriniz Bulunmamaktadır."
				}
            `,
			});

		if (member.roles.cache.has(client.settings.STREAMER_ROLE)) {
			embed.addFields({
				name: `❯ Streamer`,
				value: `\`•\` Yayında geçirdiği süre: \`${streamToplam.days} gün ${streamToplam.hours} saat ${streamToplam.minutes} dakika ${streamToplam.seconds} saniye\``,
			});
			embed.addFields({
				name: `❯ Kamera`,
				value: `\`•\` Kamerada geçirdiği süre: \`${cameraToplam.days} gün ${cameraToplam.hours} saat ${cameraToplam.minutes} dakika ${cameraToplam.seconds} saniye\``,
			});
		}
		message.channel.send({ embeds: [embed] });*/
	},
};
