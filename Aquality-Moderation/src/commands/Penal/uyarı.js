const data = require("../../models/cezalar.js");
const uyarılar = require("../../models/uyar.js");
const Discord = require("discord.js");
const ms = require("ms");
const moment = require("moment");
const sunucu = require("../../models/sunucu-bilgi");
require("moment-duration-format");
moment.locale("tr");
const { table } = require("table");
const uyar = require("../../models/uyar.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "uyar",
		usage: "uyar [@user] [sebep]",
		category: "Authorized",
		description: "Belirttiğiniz kişiyi uyarırsınız.",
		aliases: ["uyar"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.JailAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let user =
			message.mentions.members.first() ||
			(await client.üye(args[0], message.guild));
		if (!user)
			return client.send(
				"Uyarmak istediğin kullanıcyı belirtmelisin",
				message.author,
				message.channel,
			);
		let sebep = args.slice(1).join(" ");
		if (!sebep)
			return client.send(
				"Kullanıcının uyarı sebebini belirtmelisin.",
				message.author,
				message.channel,
			);
		let id = await data.countDocuments().exec();
		uyarılar.findOne({ user: user.id }, async (err, res) => {
			if (!res) {
				let arr = [];
				arr.push({
					mod: message.author.id,
					sebep: sebep,
					tarih: Date.parse(new Date()),
				});
				const newWarn = new uyarılar({
					user: user.id,
					uyarılar: arr,
				});
				await newWarn.save().catch((e) => console.log(e));
				user.roles.add(server.WarnRoleOne);
				client.PunishPointControl(user);

				await data
					.find({})
					.sort({ ihlal: "descending" })
					.exec(async (err, res) => {
						const newData = new data({
							user: user.id,
							yetkili: message.author.id,
							ihlal: id + 1,
							ceza: "Uyarı",
							sebep: sebep,
							tarih: moment(Date.parse(new Date())).format("LLL"),
							bitiş: "-",
						});
						await newData.save().catch((e) => console.error(e));
					});
				message.channel.send({
					content: `${client.emojis.cache.find(
						(x) => x.name === client.settings.emojis.yes_name,
					)} ${user} kişisine **${sebep}** sebebiyle ilk uyarısı verildi.Kullanıcının ceza puanı \`${
						(await client.punishPoint(user.id)) + 3
					}\` oldu. (Ceza Numarası: \`#${id + 1}\`)`,
				});
				await client.channels.cache
					.get(server.PenaltyPointLog)
					.send({
						content: `${user}; adlı üye aldığınız **#${
							id + 1
						}** ID'li ceza ile **${
							(await client.punishPoint(user.id)) + 3
						}** ulaştınız.`,
					})
					.catch((e) => {});
			} else {
				res.uyarılar.push({
					mod: message.author.id,
					sebep: sebep,
					tarih: Date.parse(new Date()),
				});
				await res.save().catch((e) => console.log(e));
				await data
					.find({})
					.sort({ ihlal: "descending" })
					.exec(async (err, res) => {
						const newData = new data({
							user: user.id,
							yetkili: message.author.id,
							ihlal: id + 1,
							ceza: "Uyarı",
							sebep: sebep,
							tarih: moment(Date.parse(new Date())).format("LLL"),
							bitiş: "-",
						});
						await newData.save().catch((e) => console.error(e));
					});
				if (res.uyarılar.length == 2) {
					message.channel.send({
						content: `${client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.yes_name,
						)} ${user} kişisine **${sebep}** sebebiyle 2. uyarısı verildi.Kullanıcının ceza puanı \`${
							(await client.punishPoint(user.id)) + 3
						}\` oldu. (Ceza Numarası: \`#${id + 1}\`)`,
					});
					await client.channels.cache
						.get(server.PenaltyPointLog)
						.send({
							content: `${user}; adlı üye aldığınız **#${
								id + 1
							}** ID'li ceza ile **${
								(await client.punishPoint(user.id)) + 3
							}** ulaştınız.`,
						})
						.catch((e) => {});
					await user.roles.remove(server.WarnRoleOne);
					await user.roles.add(server.WarnRoleTwo);
					client.PunishPointControl(user);
				}
				if (res.uyarılar.length == 3) {
					message.channel.send({
						content: `${client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.yes_name,
						)} ${user} kişisine **${sebep}** sebebiyle 3. uyarısı verildi.Kullanıcının ceza puanı \`${
							(await client.punishPoint(user.id)) + 3
						}\` oldu. (Ceza Numarası: \`#${id + 1}\`)`,
					});
					await client.channels.cache
						.get(server.PenaltyPointLog)
						.send({
							content: `${user}; adlı üye aldığınız **#${
								id + 1
							}** ID'li ceza ile **${
								(await client.punishPoint(user.id)) + 8
							}** ulaştınız.`,
						})
						.catch((e) => {});
					await user.roles.remove(server.WarnRoleTwo);
					await user.roles.add(server.WarnRoleThree);
					client.PunishPointControl(user);
				}
				if (res.uyarılar.length >= 4) {
					message.channel.send({
						content: `kullanıcı zaten maksimum uyarı seviyesine ulaşmış. \`!uyarılar @Kullanıcı\` yaparak uyarı geçmişini görebilirsin`,
					});
				}
			}
		});
	},
};
