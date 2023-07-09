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
		name: "ystat",
		usage: ".ystat",
		category: "Global",
		description: "Yetkili verilerinizi görüntülersiniz",
		aliases: ["ystats"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});
		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;

		const voiceModel = await VoiceModel.findOne({
			userID: member.user.id,
			guildID: message.guild.id,
		});
		const inviteModel = await InviteModel.find({
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

		const taskModel = await Tasks.find({ userID: member.user.id });

		let inviteToplam = "";
		for (let i = 0; i < inviteModel.length; i++) {
			const data = inviteModel[i];
			inviteToplam += `Toplam **${data.total}**, başarılı **${data.regular}**`;
		}
		let taggedToplam = "";
		for (let i = 0; i < taggedModel.length; i++) {
			const data = taggedModel[i];
			taggedToplam += `Toplam **${data.total}**, başarılı **${
				data.total - data.leave
			}**`;
		}
		let staffToplam = "";
		for (let i = 0; i < staffModel.length; i++) {
			const data = staffModel[i];
			staffToplam += `Toplam **${data.total}**, başarılı **${
				data.total - data.leave
			}**`;
		}

		const foundSorumluluk = member.roles.cache.filter((role) =>
			server.ResbonsibilityRole.includes(role),
		);
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

		const sessure =
			staffModel2 && staffModel2.sure[findUser] <= voiceModel.voice
				? "🟥"
				: "✅";

		const minsessure =
			staffModel2 && staffModel2.minSure[findUser] <= voiceModel.voice
				? "🟥"
				: "🟨";

		const zade_tik = client.emojis.cache.find((x) => x.name === "zade_tik");
		const zade_carpi = client.emojis.cache.find(
			(x) => x.name === "zade_carpi",
		);
		const zade_unlem = client.emojis.cache.find(
			(x) => x.name === "zade_unlem",
		);

		const tarihh = moment(
			staffModel2 && staffModel2.tarih[findUser],
			"DD MMMM YYYY HH:mm",
		);

		const yetkisure =
			moment().diff(tarihh, "days") > 14 ? zade_tik : zade_carpi;
		const minyetkisure =
			moment().diff(tarihh, "days") > 8 ? zade_tik : zade_carpi;
		const görev =
			taskModel.length > 0
				? taskModel.map((task) => task.type).join(", ")
				: `Görev Seçmelisin ${zade_unlem}`;
		const sorumluluk =
			foundSorumluluk.length > 0
				? foundSorumluluk.map((role) => role.name).join(", ")
				: `Sorumluluğunuz bulunmamakta ${zade_unlem}`;

		const toplantı = member.roles.cache.has(`${server.JoinMeetingRole}`)
			? `${zade_tik}/${zade_tik}`
			: `${zade_carpi}/${zade_carpi}`;

		const embed = new Discord.EmbedBuilder()
			.setColor("Aqua")
			.setAuthor({
				name: member.user.username,
				iconURL: member.user.avatarURL({ dynamic: true }),
			})
			.setDescription(
				`
${member.toString()} adlı üyenin stat durumu;

\`• Yetki veren/tarihi :\` ${
					staffModel2
						? `<@${staffModel2.userID}> / <t:${tarih}:R>`
						: "Bulunamadı / Bulunamadı"
				}
\`• Değerlendirme Saati:\` ${sesli} (\`Min: ${minsesli}\`) ${sessure} ${minsessure}
\`• Görev              :\` ${görev}
\`• Sorumluluk         :\` ${sorumluluk}
\`• Yetki süresi       :\` ${minyetkisure}/${yetkisure} (8 Gün / 14 Gün)
\`• Bireysel/Genel T.  :\` ${toplantı}

${
	taskModel.length > 0
		? `Görev Durumu ${zade_unlem}\n\n${taskModel
				.map(
					(task) =>
						`\`• ${task.type}\` - **Bitiş:** <t:${Math.floor(
							task.end / 1000,
						)}:R>\n${client.progressBar(
							task.level,
							task.target,
							8,
						)} ${
							task.type == "Ses"
								? `\`${moment
										.duration(task.level)
										.format("H [saat], m [dk]")} / ${moment
										.duration(task.target)
										.format("H [saat], m [dk]")}\`\n`
								: ` ${
										task.level >= task.target
											? "(%100)"
											: `(%${Math.floor(
													(task.level / task.target) *
														100,
											  )})
						  `
								  }`
						}`,
				)
				.join("")} `
		: ""
}

`,
			);

		message.reply({ embeds: [embed] });
	},
};
