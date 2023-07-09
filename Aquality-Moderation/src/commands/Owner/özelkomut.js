const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const Discord = require("discord.js");
const db = require("../../models/vrcRoleCommands");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "komut",
		usage: "komut ekle [isim] [@rol]",
		category: "Owner",
		description:
			"Yetenek rollerini ve diğer sunucu rollerini vermeye yarar.",
		aliases: ["cmd"],
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
		let arr = ["ekle", "izin", "sil", "engelle", "ekle", "kaldır", "bilgi"];
		if (!arr.includes(args[0]))
			return client.send(
				"Argümanları doğru şekilde yerleştirip tekrar deneyin;\n`!komut ekle <isim> @rol`",
				message.author,
				message.channel,
			);
		if (args[0] === "ekle") {
			let res = await db.findOne({ cmdName: args[1] });
			if (res)
				return message.channel.send({
					content: `\`${args[1]}\` adında bir komut zaten mevcut.`,
				});

			let role =
				message.mentions.roles.first() ||
				(await message.guild.roles.cache.get(args[2]));
			if (!role)
				return message.channel.send({
					content: `\`${args[1]}\` komutuna atamak için geçerli bir rol belirtin.\n\`.komut ekle <isim> @rol\``,
				});

			let buffer = new db({
				cmdName: args[1],
				allowedRoles: [],
				role: role.id,
				blockedUsers: [],
				allowedUsers: [],
			});
			//Allah-u ATATÜRK

			return await buffer.save().then(() => {
				message.channel.send({
					content: `\`${args[1]}\` adlı bir komut oluşturuldu. Bu komutu kullananlara \`${role.name}\` rolü verilecek.`,
				});
			});
		}

		if (args[0] === "izin") {
			let newArr = ["ekle", "kaldır", "kaldir", "ver"];
			if (!newArr.includes(args[1]))
				return client.send(
					"Argümanları doğru şekilde yerleştirip tekrar deneyin;\n`!komut izin ekle/kaldır <isim> @rol`",
					message.author,
					message.channel,
				);

			let res = await db.findOne({ cmdName: args[2] });
			if (!res)
				return message.channel.send({
					content: `\`${args[2]}\` adında bir komut bulunamadı.`,
				});

			let role =
				message.mentions.roles.first() ||
				(await message.guild.roles.cache.get(args[3]));
			let user =
				message.mentions.members.first() ||
				(await message.guild.members.cache.get(args[3]));
			if (!role && !user)
				return message.channel.send({
					content: `\`${args[2]}\` komutuna atamak için geçerli bir üye ya da rol belirtin.\n\`.komut izin ekle/kaldır <isim> @rol\``,
				});
			if (!user && role && role.id === res.role)
				return message.channel.send({
					content: `Komutta verilecek rol, izni tanınan rolden farklı olmalıdır.`,
				});

			if (!user && role) {
				if (args[1] === "ekle" || args[1] === "ver") {
					if (res.allowedRoles.includes(role.id))
						return message.channel.send({
							content: `${role.name} rolünün zaten \`${args[2]}\` komutunu kullanma izni var.`,
						});
					res.allowedRoles.push(role.id);
					return await res.save().then(() => {
						message.channel.send({
							content: `${role.name} rolündeki üyeler artık \`${args[2]}\` komutunu kullanabilecek.`,
						});
					});
				} else {
					if (!res.allowedRoles.includes(role.id))
						return message.channel.send({
							content: `${role.name} rolünün zaten \`${args[2]}\` komutunu kullanma izni yok.`,
						});
					res.allowedRoles.splice(
						res.allowedRoles.indexOf(role.id),
						1,
					);
					return await res.save().then(() => {
						message.channel.send({
							content: `${role.name} rolündeki üyelerin \`${args[2]}\` komutunu kullanma izni kaldırıldı.`,
						});
					});
				}
			}

			if (!role && user) {
				if (args[1] === "ekle" || args[1] === "ver") {
					if (res.allowedRoles.includes(user.id))
						return message.channel.send({
							content: `${user} kişisinin zaten \`${args[2]}\` komutunu kullanma izni var.`,
						});
					res.allowedUsers.push(user.id);
					return await res.save().then(() => {
						message.channel.send({
							content: `${user} artık \`${args[2]}\` komutunu kullanabilecek.`,
						});
					});
				} else {
					if (!res.allowedUsers.includes(user.id))
						return message.channel.send({
							content: `${user} kişisinin zaten \`${args[2]}\` komutunu kullanma izni yok.`,
						});
					res.allowedUsers.splice(
						res.allowedUsers.indexOf(user.id),
						1,
					);
					return await res.save().then(() => {
						message.channel.send({
							content: `${user} kişisinin \`${args[2]}\` komutunu kullanma izni kaldırıldı.`,
						});
					});
				}
			}
		}

		if (args[0] === "sil" || args[0] === "kaldır" || args[0] === "kaldir") {
			let res = await db.findOne({ cmdName: args[1] });
			if (!res)
				return message.channel.send({
					content: `\`${args[1]}\` adında bir komut bulunamadı.`,
				});

			return res.delete().then(() => {
				message.channel.send({
					content: `\`${args[1]}\` komutu silindi.`,
				});
			});
		}

		if (args[0] === "engelle") {
			let res = await db.findOne({ cmdName: args[1] });
			if (!res)
				return message.channel.send({
					content: `\`${args[1]}\` adında bir komut bulunamadı.`,
				});

			let member =
				message.mentions.members.first() ||
				message.guild.members.cache.get(args[2]);
			if (!member)
				return message.channel.send({
					content: `\`${args[1]}\` komutundan engellemek için bir üye belirtin.\n\`.komut engelle <isim> @üye\``,
				});

			if (res.blockedUsers.includes(member.user.id)) {
				await res.blockedUsers.splice(
					res.blockedUsers.indexOf(member.user.id),
					1,
				);
				await res.save();
				return message.channel.send({
					content: `<@${member.user.id}> üyesinin \`${args[1]}\` komutunu kullanım engeli kalktı.`,
				});
			} else {
				await res.blockedUsers.push(member.user.id);
				await res.save();
				return message.channel.send({
					content: `<@${member.user.id}> üyesi \`${args[1]}\` komutunun kullanımından engellendi.`,
				});
			}
		}
	},
};
