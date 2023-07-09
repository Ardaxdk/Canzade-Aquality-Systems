let serverSettings = require("../models/serverSettings");
const { EmbedBuilder } = require("discord.js");
const cezalar = require("../models/cezalı.js");
const ceza = require("../models/cezalar.js");
const moment = require("moment");
require("moment-duration-format");

module.exports = async (client) => {
	client.PunishPointControl = async (member) => {
		let server = await serverSettings.findOne({});

		let puan = await client.punishPoint(member.id);
		let id = await ceza.countDocuments().exec();

		if (puan >= 75) {
			const embed = new EmbedBuilder()
				.setAuthor({
					name: client.user.username,
					iconURL: client.user.avatarURL({ dynamic: true }),
				})
				.setColor("Random").setDescription(`
${member.toString()} kişisi **75 ve üstü ceza puanına sahip olduğu için 1 aylık slave atıldı - Oto Slave** sebebiyle cezalı veritabanına kayıt edildi. (Ceza Numarası: \`#${
				id + 1
			}\`)
        `);
			client.channels.cache
				.get(server.PenaltyPointLog)
				.send({ embeds: [embed] });

			await cezalar.findOne({ user: member.id }, async (err, doc) => {
				let memberRoles = member.roles.cache.map((x) => x.id);
				await member.roles
					.set(
						member.roles.cache.has(server.BoosterRole)
							? (server.BoosterRole, server.QuarantineRole)
							: server.QuarantineRole,
					)
					.catch((e) => console.log(e));

				const zaaaa = new EmbedBuilder()
					.setAuthor({
						name: client.user.username,
						iconURL: client.user.displayAvatarURL({
							dynamic: true,
						}),
					})
					.setColor("Random")
					.setFooter({
						text: `Ceza Numarası: #${id + 1}`,
					}).setDescription(`
${member} (\`${member.user.username}\` - \`${
					member.id
				}\`) kişisine **75 ve üstü ceza puanına sahip olduğu için 1 aylık slave atıldı - Oto Slave** sebebiyle <@&${
					server.QuarantineRole
				}> rolü verildi.

• Jail atılma tarihi: ${moment(Date.parse(new Date())).format("LLL")}
• Jail sebebi: **75 ve üstü ceza puanına sahip olduğu için 1 aylık slave atıldı - Oto Slave**
`);
				await client.channels.cache
					.get(server.JailLog)
					.send({ embeds: [zaaaa] });

				if (!doc) {
					const newPun = new cezalar({
						user: member.id,
						ceza: true,
						roller: memberRoles,
						yetkili: client.user.id,
						tarih: moment(Date.parse(new Date())).format("LLL"),
						bitis: Date.now() + 1000 * 60 * 60 * 1,
						sebep: "75 ve üstü ceza puanına sahip olduğu için 1 aylık slave atıldı - Oto Slave",
					});
					await newPun.save().catch((e) => console.log(e));
				}
				await ceza
					.find({})
					.sort({ ihlal: "descending" })
					.exec(async (err, res) => {
						const newData = new ceza({
							user: member.id,
							yetkili: client.user.id,
							ihlal: id + 1,
							ceza: "Cezalı",
							sebep: "75 ve üstü ceza puanına sahip olduğu için 1 aylık slave atıldı - Oto Slave",
							tarih: moment(Date.parse(new Date())).format("LLL"),
							bitiş: moment(
								Date.parse(new Date()) + 1000 * 60 * 60 * 1,
							).format("LLL"),
						});
						await newData.save().catch((e) => console.error(e));
					});
			});
		}
	};
};
