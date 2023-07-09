const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
const Task = require("../../models/task");

module.exports = {
	conf: {
		name: "gorev",
		usage: ".gorev",
		category: "BotOwner",
		description: "Görev seçmenize yarar.",
		aliases: ["görev"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});
		if (
			!message.member.roles.cache.some((r) =>
				server.BotCommandRole.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.guild.iconURL(),
			})
			.setColor("Aqua")
			.setDescription(
				`
Görev detayı ve durumu hakkında bilgi almak için lütfen \`.task\` komutunu kullanın.`,
			)
			.addFields({
				name: "Ses Görevi",
				value: `Ses kanallarında rastgele bir süre zaman geçirmelisin.`,
			})
			.addFields({
				name: "Mesaj Görevi",
				value: "Metin kanallarına rastgele bir sayıda mesaj göndermelisin.",
			})
			.addFields({
				name: "Taglı Görevi",
				value: "Tagımızı alan rastgele sayı kullanıcıları taglı olarak işaretlemelisin.",
			})
			.addFields({
				name: "Cookie Görevi",
				value: "Rastgele kişilerden rastgele sayıda cookie almalısın.",
			})
			.addFields({
				name: "Davet Görevi",
				value: "Sunucumuza rastgele sayıda gerçek kullanıcı davet etmelisin.",
			})
			.addFields({
				name: "Yetkili Görevi",
				value: "Bu görevi yalnızca `.r ver` komutunu kullanma yetkisi olan kişiler seçebilir.",
			});

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.StringSelectMenuBuilder()
				.setCustomId("task")
				.setPlaceholder("Görev almak için tıkla.")
				.addOptions([
					{
						label: "🔊 Ses Görevi",
						value: "1",
					},
					{
						label: "💬 Mesaj Görevi",
						value: "2",
					},
					{
						label: "👤 Taglı Görevi",
						value: "3",
					},
					{
						label: "🍪 Cookie Görevi",
						value: "4",
					},
					{
						label: "👤 Davet Görevi",
						value: "5",
					},
					{
						label: "👤 Yetkili Görevi",
						value: "6",
					},
				]),
		);

		let msg = await message.channel.send({
			embeds: [embed],
			components: [row],
		});
		var filter = (interaction) => interaction.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 60000,
		});

		collector.on("collect", async (interaction) => {
			if (interaction.customId === "task") {
				let server = await serverSettings.findOne({});
				if (
					!interaction.member.roles.cache.some((r) =>
						server.BotCommandRole.includes(r.id),
					)
				)
					return interaction.reply({
						content: `Görev seçebilmek için <@&${server.BotCommandRole}> rolüne sahip olmalısın.`,
						ephemeral: true,
					});
				const task = await Task.findOne({
					userID: interaction.user.id,
					tasknumber: interaction.values[0],
				});
				const task2 = await Task.find({
					userID: interaction.user.id,
				});
				if (task && task.tasknumber)
					return interaction.reply({
						content: "zaten bu göreve sahipsin",
						ephemeral: true,
					});
				if (interaction.values[0] === "1") {
					// if (task2 && task2.length >= 1)
					// 	return interaction.reply({
					// 		content:
					// 			"Maksimum 1 adet görev seçebilirsin. Şuanki görevinden memnun değilsen iptal edip tekrar seçebilirsin",
					// 		ephemeral: true,
					// 	});
					let type = "Ses";
					let target =
						1000 * 60 * 60 * Math.floor(Math.random() * 2 + 2);
					let description = `Seste ${moment
						.duration(target)
						.format("H [saat], m [dk]")} vakit geçir!`;
					let point = Math.floor(Math.random() * 250 + 75);

					await client.taskAdd(
						interaction,
						type,
						target,
						point,
						description,
					);

					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setAuthor({
									name: message.author.username,
									iconURL: message.author.displayAvatarURL(),
								})
								.setColor("Aqua")
								.setDescription(`**Ses** görevini seçtin. 

Bir sonraki yükseltimine kadar ${moment
								.duration(target)
								.format(
									"H [saat], m [dk]",
								)} süre ses kanallarında geçirmelisin.`),
						],
						components: [],
					});
				} else if (interaction.values[0] === "2") {
					// if (task2 && task2.length >= 1)
					// 	return interaction.reply({
					// 		content:
					// 			"Maksimum 1 adet görev seçebilirsin. Şuanki görevinden memnun değilsen iptal edip tekrar seçebilirsin",
					// 		ephemeral: true,
					// 	});
					let type = "Mesaj";
					let target = Math.floor(Math.random() * 250 + 100);
					let description = `Metin kanallarında ${target} mesaj at!`;
					let point = Math.floor(Math.random() * 150 + 100);

					await client.taskAdd(
						interaction,
						type,
						target,
						point,
						description,
					);
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setAuthor({
									name: message.author.username,
									iconURL: message.author.displayAvatarURL(),
								})
								.setColor("Aqua")
								.setDescription(`**Mesaj** görevini seçtin. 

Bir sonraki yükseltimine kadar ${target} mesaj atmalısın.`),
						],
						components: [],
					});
				} else if (interaction.values[0] === "3") {
					// if (task2 && task2.length >= 1)
					// 	return interaction.reply({
					// 		content:
					// 			"Maksimum 1 adet görev seçebilirsin. Şuanki görevinden memnun değilsen iptal edip tekrar seçebilirsin",
					// 		ephemeral: true,
					// 	});
					let type = "Taglı";
					let target = Math.floor(Math.random() * 5 + 5);
					let description = `${target} kişiye tag aldır!`;
					let point = Math.floor(Math.random() * 200 + 80);

					await client.taskAdd(
						interaction,
						type,
						target,
						point,
						description,
					);
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setAuthor({
									name: message.author.username,
									iconURL: message.author.displayAvatarURL(),
								})
								.setColor("Aqua")
								.setDescription(`**Taglı** görevini seçtin. 

Bir sonraki yükseltimine kadar ${target} taglı kullanıcıyı taglı olarak işaretlemelisin.`),
						],
						components: [],
					});
				} else if (interaction.values[0] === "4") {
					// if (task2 && task2.length >= 1)
					// 	return interaction.reply({
					// 		content:
					// 			"Maksimum 1 adet görev seçebilirsin. Şuanki görevinden memnun değilsen iptal edip tekrar seçebilirsin",
					// 		ephemeral: true,
					// 	});
					let type = "Cookie";
					let target = Math.floor(Math.random() * 3 + 2);
					let description = `Arkadaşlarından hediye ${target} kurabiye al!`;
					let point = Math.floor(Math.random() * 150 + 100);

					await client.taskAdd(
						interaction,
						type,
						target,
						point,
						description,
					);
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setAuthor({
									name: message.author.username,
									iconURL: message.author.displayAvatarURL(),
								})
								.setColor("Aqua")
								.setDescription(`**Cookie** görevini seçtin. 

Bir sonraki yükseltimine kadar ${target} farklı kişiden cookie almalısın.`),
						],
						components: [],
					});
				} else if (interaction.values[0] === "5") {
					// if (task2 && task2.length >= 1)
					// 	return interaction.reply({
					// 		content:
					// 			"Maksimum 1 adet görev seçebilirsin. Şuanki görevinden memnun değilsen iptal edip tekrar seçebilirsin",
					// 		ephemeral: true,
					// 	});
					let type = "Davet";
					let target = Math.floor(Math.random() * 3 + 3);
					let description = `Sunucuya ${target} üye davet et`;
					let point = Math.floor(Math.random() * 150 + 100);

					await client.taskAdd(
						interaction,
						type,
						target,
						point,
						description,
					);
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setAuthor({
									name: message.author.username,
									iconURL: message.author.displayAvatarURL(),
								})
								.setColor("Aqua")
								.setDescription(`**Davet** görevini seçtin. 

Bir sonraki yükseltimine kadar ${target} gerçek kullanıcıyı sunucumuza davet etmelisin.`),
						],
						components: [],
					});
				} else if (interaction.values[0] === "6") {
					// if (task2 && task2.length >= 1)
					// 	return interaction.reply({
					// 		content:
					// 			"Maksimum 1 adet görev seçebilirsin. Şuanki görevinden memnun değilsen iptal edip tekrar seçebilirsin",
					// 		ephemeral: true,
					// 	});
					if (
						!interaction.member.roles.cache.some((r) =>
							server.RoleManageAuth.includes(r.id),
						) &&
						!message.member.permissions.has(
							Discord.PermissionsBitField.Flags.ViewAuditLog,
						)
					)
						return interaction.reply({
							content: `Görev seçebilmek için <@&${server.RoleManageAuth}> rolüne sahip olmalısın.`,
							ephemeral: true,
						});
					let type = "Yetkili";
					let target = Math.floor(Math.random() * 7 + 5);
					let description = `Sunucuya ${target} yetkili çek`;
					let point = Math.floor(Math.random() * 150 + 100);

					await client.taskAdd(
						interaction,
						type,
						target,
						point,
						description,
					);
					msg.edit({
						embeds: [
							new Discord.EmbedBuilder()
								.setAuthor({
									name: message.author.username,
									iconURL: message.author.displayAvatarURL(),
								})
								.setColor("Aqua")
								.setDescription(`**Yetkili** görevini seçtin. 

Bir sonraki yükseltimine kadar ${target} tagımıza sahip kişiye yetki vermelisin.`),
						],
						components: [],
					});
				} /* else if (interaction.values[0] == "7") {
					await Task.deleteOne(
						{ userID: interaction.user.id },
						(err) => {
							if (err) {
								console.log("Silinemedi.");
							}
						},
					);
					interaction.reply({
						content:
							"Başarıyla mevcut görevini sıfırladım. Yeniden bir görev seçmek için `.görev` komudunu kullanabilirsin",
					});
				}*/
			}
		});

		collector.on("end", () => {
			msg.edit({
				embeds: [
					new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL(),
						})
						.setColor("Aqua")
						.setDescription(
							`Süre dolduğu için işlem iptal edildi.`,
						),
				],
				components: [],
			});
		});
	},
};
