const Discord = require("discord.js");
const ChannelModel = require("../../models/channelModel");
const Tasks = require("../../models/task");
const InviteModel = require("../../models/inviter");
const TaggedModel = require("../../models/tagged");
const StaffModel = require("../../models/staff");
const VoiceModel = require("../../models/voiceModel");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");

module.exports = {
	conf: {
		name: "verilerim",
		usage: ".verilerim",
		category: "Global",
		description: "Yetkili verilerinizi görüntülersiniz",
		aliases: ["verilerim"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;

		const voiceModel = await VoiceModel.find({
			userID: member.user.id,
			guildID: message.guild.id,
		});

		const taggedModel = await TaggedModel.find({
			userID: member.user.id,
			guildID: message.guild.id,
		});

		const staffModel = await StaffModel.find({
			userID: member.user.id,
			guildID: message.guild.id,
		});
		const staffModel2 = await StaffModel.findOne({
			yetkililer: member.user.id,
		});
		const inviteModel = await InviteModel.find({
			userID: member.user.id,
			guildID: message.guild.id,
		});

		let voiceToplam = "";
		for (let i = 0; i < voiceModel.length; i++) {
			const data = voiceModel[i];
			voiceToplam += `\`${moment
				.duration(data.voice)
				.format("D [gün], H [saat], m [dk]")}.\``;
		}

		let streamToplam = "";
		for (let i = 0; i < voiceModel.length; i++) {
			const data = voiceModel[i];
			streamToplam += `${moment
				.duration(data.streaming)
				.format("D [gün], H [saat], m [dk]")}.`;
		}
		let camToplam = "";
		for (let i = 0; i < voiceModel.length; i++) {
			const data = voiceModel[i];
			camToplam += `${moment
				.duration(data.cam)
				.format("D [gün], H [saat], m [dk]")}.`;
		}

		let textToplam = "";
		for (let i = 0; i < voiceModel.length; i++) {
			const data = voiceModel[i];
			textToplam += `${data.messages} Mesaj`;
		}

		let inviteToplam = "";
		for (let i = 0; i < inviteModel.length; i++) {
			const data = inviteModel[i];
			inviteToplam += `Toplam ${data.total}, başarılı ${data.regular}`;
		}
		let taggedToplam = "";
		for (let i = 0; i < taggedModel.length; i++) {
			const data = taggedModel[i];
			taggedToplam += `Toplam ${data.total}, başarılı ${
				data.total - data.leave
			}`;
		}
		let staffToplam = "";
		for (let i = 0; i < staffModel.length; i++) {
			const data = staffModel[i];
			staffToplam += `Toplam ${data.total}, başarılı ${
				data.total - data.leave
			}`;
		}
		const findUser =
			staffModel2 && staffModel2.yetkililer.indexOf(member.id);
		const tarih = moment(
			staffModel2 && staffModel2.tarih[findUser],
			"DD MMMM YYYY HH:mm",
		).unix();
		const sesli = moment
			.duration(staffModel2 && staffModel2.sure[findUser])
			.format("H [saat], m [dk]");
		const minsesli = moment
			.duration(staffModel2 && staffModel2.minSure[findUser])
			.format("H [saat], m [dk]");
		const embed = new Discord.EmbedBuilder()
			.setColor("Random")
			.setAuthor({
				name: member.user.username,
				iconURL: member.user.displayAvatarURL({
					dynamic: true,
				}),
			})
			.setDescription(
				`${member.toString()} (${
					member.roles.highest
				}) kişisinin 30 günlük sunucu verileri`,
			)
			.addFields({
				name: `❯ Ses Bilgisi`,
				value: `\`•\` ${voiceToplam || "Bulunamadı"}`,
			})
			.addFields({
				name: `❯ Mesaj Bilgisi`,
				value: `\`•\` \`${textToplam || "Bulunamadı"}\``,
			})
			.addFields({
				name: `❯ Yayın Bilgisi - Kamera Bilgisi`,
				value: `\`•\` \`${streamToplam || "Bulunamadı"} - ${
					camToplam || "Bulunamadı"
				}\``,
			})
			.addFields({
				name: `❯ Davet Bilgisi`,
				value: `\`•\` \`${inviteToplam || "Bulunamadı"}\``,
			});

		if (server.BotCommandRole.some((x) => member.roles.cache.has(x))) {
			embed.addFields({
				name: `❯ Taglı Bilgisi`,
				value: `\`•\` \`${taggedToplam || "Bulunamadı"}\``,
			});
			embed.addFields({
				name: `❯ Yetkili Çekim Bilgisi
            `,
				value: `\`•\` \`${staffToplam || "Bulunamadı"}\``,
			});

			const botYetkiliRole = message.guild.roles.cache.get(
				`${server.BotCommandRole}`,
			);
			const roles = member.roles.cache.filter(
				(role) => role.position > botYetkiliRole.position,
			);
			const role = roles.first();

			embed.addFields({
				name: `❯ Yetki Bilgisi
            `,
				value:
					`\`•\` Tespit edilen yetki: ${
						role ? role.name : "Bulunamadı"
					}\n` +
					`Yetkili olma tarihi: ${
						staffModel2 ? `<t:${tarih}:R>` : "Bulunamadı"
					}\n\n` +
					`Toplam değerlendirme saati: \`${sesli}\`\n` +
					`🟢 Minimum saat: \`${minsesli}\``,
			});
		}
		message.reply({ embeds: [embed] });
	},
};
