const Discord = require("discord.js");
const toplantıModel = require("../../models/toplantı.js");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = {
	conf: {
		name: "toplantı",
		usage: "toplantı bireysel/genel/yükseltim <bitir>",
		category: "GuildOwner",
		description: "Toplantı başlatırsınız",
		aliases: ["toplanti"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});

		if (
			!message.member.roles.cache.some((r) =>
				server.GuildOwner.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.Administrator,
			)
		)
			return;

		if (
			!message.member.voice.channel ||
			message.member.voice.channelId !== server.MeetingChannel
		)
			return client.send(
				`Toplantı başlatabilmek için <#${server.MeetingChannel}> kanalında olmalısın`,
				message.author,
				message.channel,
			);

		if (!args[0])
			return client.send(
				".toplantı bireysel/genel/yükseltim/kontrol/bilgi/katılmayan \n Örnek: `.toplantı genel`",
				message.author,
				message.channel,
			);

		const userrow = new Discord.ActionRowBuilder().addComponents(
			new Discord.UserSelectMenuBuilder()
				.setCustomId("user_select")
				.setMinValues(1)
				.setMaxValues(20),
		);
		const rolerow = new Discord.ActionRowBuilder().addComponents(
			new Discord.RoleSelectMenuBuilder()
				.setCustomId("role_select")
				.setMinValues(1)
				.setMaxValues(20),
		);
		let meetingNumber = await toplantıModel.countDocuments().exec();

		if (args[0] == "bilgi") {
			if (!args[1])
				return client.send(
					"Bir toplantı numarası girmelisin",
					message.author,
					message.channel,
				);
			if (args[1] && isNaN(args[1]))
				return client.send(
					`Sayı yazmalısın.`,
					message.author,
					message.channel,
				);
			await toplantıModel.findOne(
				{ toplantiId: args[1] },
				async (err, res) => {
					if (!res)
						return client.send(
							`Belirttiğin ${args[1]} numaralı toplantı bilgisi bulunamadı.`,
							message.author,
							message.channel,
						);

					const tarih = moment
						.duration(res.bitiş - res.tarih)
						.format("H [saat], m [dk]");

					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL(),
						})
						.setColor("Random").setDescription(`
\`Toplantıyı başlatan :\` <@${res.yetkili}> - ${res.type} Toplantı
\`Toplantıyı kapsayan :\` ${
						res.type == "Yükseltim"
							? res.uyeler.map((x) => `<@&${x}>`)
							: res.type == "Genel"
							? `<@&${server.BotCommandRole}> ve üstü`
							: `${res.uyeler.map((x) => `<@${x}>`)}`
					}
\`Toplantı durumu     :\` ${res.active == true ? "Devam ediyor" : "Bitmiş"}
\`Toplantı süresi     :\` ${tarih}
\`Toplantı başlangıç  :\` ${moment(res.tarih).format("LLL")}
\`Toplantı bitiş      :\` ${
						res.active == false
							? moment(res.bitiş).format("LLL")
							: "Toplantı devam etmekte."
					}
                        `);

					message.reply({ embeds: [embed] });
				},
			);
		}

		if (args[0] == "bitir") {
			if (!args[1])
				return client.send(
					"Bir toplantı numarası girmelisin",
					message.author,
					message.channel,
				);
			if (args[1] && isNaN(args[1]))
				return client.send(
					`Sayı yazmalısın.`,
					message.author,
					message.channel,
				);
			await toplantıModel.findOne(
				{ toplantiId: args[1] },
				async (err, res) => {
					if (!res)
						return client.send(
							`Belirttiğin ${args[1]} numaralı toplantı bilgisi bulunamadı.`,
							message.author,
							message.channel,
						);
					if (res.yetkili !== message.author.id)
						return client.send(
							`#${args[1]} ID'li toplantıyı sen başlatmamışsın bu yüzden toplantıyı sonlandıramazsın.`,
							message.author,
							message.channel,
						);

					if (res.active == false)
						return client.send(
							`${args[1]} ID'li toplantı zaten sonlandırılmış.`,
							message.author,
							message.channel,
						);

					res.active = false;
					(res.bitiş = Date.now()), await res.save();

					client.send(
						`Başarıyla ${args[1]} ID'li toplantı sonlandırıldı. Toplantı detaylarına bakmak için \`.toplantı bilgi ${args[1]}\` komutunu kullan`,
						message.author,
						message.channel,
					);
				},
			);
		}

		if (args[0] === "kontrol") {
			if (!args[1])
				return client.send(
					"Bir toplantı numarası girmelisin",
					message.author,
					message.channel,
				);
			if (args[1] && isNaN(args[1]))
				return client.send(
					`Sayı yazmalısın.`,
					message.author,
					message.channel,
				);

			await toplantıModel.findOne(
				{ toplantiId: args[1] },
				async (err, res) => {
					if (!res)
						return client.send(
							`Belirttiğin ${args[1]} numaralı toplantı bilgisi bulunamadı.`,
							message.author,
							message.channel,
						);

					if (res.active == false)
						return client.send(
							`${args[1]} ID'li toplantı zaten sonlandırıldığı için katıldı rolü dağıtımını gerçekleştiremiyorum.`,
							message.author,
							message.channel,
						);

					if (res.type == "Yükseltim") {
						const members = message.guild.members.cache.filter(
							(member) =>
								member.roles.cache.some((r) =>
									res.uyeler.includes(r.id),
								),
						);

						members.forEach(async (member) => {
							if (
								member.voice.channel &&
								member.voice.channel.id ===
									server.MeetingChannel
							) {
								await member.roles.add(server.JoinMeetingRole);
							} else {
								if (
									server.JoinMeetingRole.some((x) =>
										member.roles.cache.has(x),
									)
								) {
									await member.roles.remove(
										server.JoinMeetingRole,
									);
								}
							}
						});
					}
					if (res.type == "Bireysel") {
						const members = message.guild.members.cache.filter(
							(member) => res.uyeler.includes(member.id),
						);

						members.forEach(async (member) => {
							if (
								member.voice.channel &&
								member.voice.channel.id ===
									server.MeetingChannel
							) {
								await member.roles.add(server.JoinMeetingRole);
							} else {
								if (
									server.JoinMeetingRole.some((x) =>
										member.roles.cache.has(x),
									)
								) {
									await member.roles.remove(
										server.JoinMeetingRole,
									);
								}
							}
						});
					}
					if (res.type == "Genel") {
						let roles = message.guild.roles.cache.get(
							`${server.BotCommandRole}`,
						);

						let yetkili = [
							...message.guild.members.cache
								.filter(
									(uye) =>
										!uye.user.bot &&
										uye.roles.highest.position >=
											roles.position,
								)
								.values(),
						];
						yetkili.forEach(async (member) => {
							if (
								member.voice.channel &&
								member.voice.channel.id ===
									server.MeetingChannel
							) {
								await member.roles.add(server.JoinMeetingRole);
							} else {
								if (
									server.JoinMeetingRole.some((x) =>
										member.roles.cache.has(x),
									)
								) {
									await member.roles.remove(
										server.JoinMeetingRole,
									);
								}
							}
						});
					}
					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL(),
						})
						.setColor("Random")
						.setDescription(
							`#${res.toplantiId} ID'li ${res.type} kategorili toplantıda bulunanlara katıldı rolü dağıtma işlemi başarıyla tamamlandı!`,
						);
					message.reply({ embeds: [embed] });
				},
			);
		}

		if (args[0] === "katılmayan" || args[0] === "katılmayanlar") {
			if (!args[1])
				return client.send(
					"Bir toplantı numarası girmelisin",
					message.author,
					message.channel,
				);
			if (args[1] && isNaN(args[1]))
				return client.send(
					`Sayı yazmalısın.`,
					message.author,
					message.channel,
				);
			await toplantıModel.findOne(
				{ toplantiId: args[1] },
				async (err, res) => {
					if (!res)
						return client.send(
							`Belirttiğin ${args[1]} numaralı toplantı bilgisi bulunamadı.`,
							message.author,
							message.channel,
						);

					if (res.active == false)
						return client.send(
							`${args[1]} ID'li toplantı zaten sonlandırıldığı için toplantıya katılmayanları gösteremiyorum.`,
							message.author,
							message.channel,
						);

					let uyeler;
					if (res.type == "Yükseltim") {
						uyeler = message.guild.members.cache.filter(
							(member) =>
								member.voice.channelId !==
									server.MeetingChannel &&
								!member.user.bot &&
								member.roles.cache.some((r) =>
									res.uyeler.includes(r.id),
								),
						);
					}
					if (res.type == "Bireysel") {
						uyeler = message.guild.members.cache.filter(
							(member) =>
								res.uyeler.includes(member.id) &&
								member.voice.channelId !==
									server.MeetingChannel,
						);
					}
					if (res.type == "Genel") {
						let roles = message.guild.roles.cache.get(
							`${server.BotCommandRole}`,
						);

						uyeler = [
							...message.guild.members.cache
								.filter(
									(uye) =>
										!uye.user.bot &&
										uye.roles.highest.position >=
											roles.position &&
										uye.voice.channelId !==
											server.MeetingChannel,
								)
								.values(),
						];
					}
					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL(),
						})
						.setColor("Random")
						.setDescription(`${uyeler.map((x) => `${x}`)}`);
					message.reply({ embeds: [embed] });
				},
			);
		}

		if (args[0] === "bireysel") {
			let toplantı = await toplantıModel.findOne({
				yetkili: message.author.id,
				type: "Bireysel",
			});
			if (toplantı && toplantı.active == true)
				return client.send(
					`Zaten aktif bir bireysel toplantınız mevcut \`.toplantı bitir ${toplantı.toplantiId}\` yaparak sonlandırabilirsin`,
					message.author,
					message.channel,
				);

			let msg = await message.channel.send({
				content: `Lütfen toplantı gerçekleştirmek istediğiniz kullanıcıları belirtin.`,
				components: [userrow],
			});
			var filter = (interaction) => interaction.user.id;
			const collector = msg.createMessageComponentCollector({
				filter,
				time: 30000,
			});

			collector.on("collect", async (interaction) => {
				userrow.components[0].setDisabled(true);
				msg.edit({ components: [userrow] });
				if (interaction.customId === "user_select") {
					interaction.deferUpdate();

					await toplantıModel
						.find({})
						.sort({ toplantiId: "descending" })
						.exec(async (err, res) => {
							const newData = new toplantıModel({
								yetkili: message.author.id,
								uyeler: interaction.values.map((id) => id),
								active: true,
								type: "Bireysel",
								toplantiId: meetingNumber + 1,
								tarih: Date.now(),
							});
							await newData.save().catch((e) => console.error(e));
						});

					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL(),
						})
						.setColor("Random")
						.setTitle(`Toplantı Numarası: ${meetingNumber + 1}`)
						.setDescription(
							`Başarıyla bireysel toplantı ${interaction.values
								.map((id) =>
									message.guild.members.cache.get(id),
								)
								.join(
									", ",
								)} kullanıcılarıyla başlatıldı.\nToplantıya katılması beklenilen **${
								interaction.values.map((id) =>
									message.guild.members.cache.get(id),
								).length
							}** kişi!

Toplantı manuel olarak bitirilmediği takdirde **1.30** saat sonra otomatik olarak sonlanacak
Toplantıya katılmayanların listesini görüntülemek için \`.toplantı katılmayan ${
								meetingNumber + 1
							}\`
Toplantıyı bitirmek için \`.toplantı bitir ${meetingNumber + 1}\`
Toplantının ne zaman başladığını, bittiğini ve ne kadar sürdüğünü öğrenmek için \`.toplantı bilgi ${
								meetingNumber + 1
							}\``,
						);

					message.channel.send({ embeds: [embed] });

					interaction.values.map(async (user) => {
						const member =
							interaction.guild.members.cache.get(user);

						if (
							member.voice.channel &&
							member.voice.channel.id === server.MeetingChannel
						) {
							await member.roles.add(server.JoinMeetingRole);
						} else {
							if (
								server.JoinMeetingRole.some((x) =>
									member.roles.cache.has(x),
								)
							) {
								await member.roles.remove(
									server.JoinMeetingRole,
								);
							}
						}
					});
				}
			});
		}
		if (args[0] === "genel") {
			let toplantı = await toplantıModel.findOne({
				yetkili: message.author.id,
				type: "Genel",
			});
			if (toplantı && toplantı.active == true)
				return client.send(
					`Zaten aktif bir genel toplantınız mevcut \`.toplantı bitir ${toplantı.toplantiId}\` yaparak sonlandırabilirsin`,
					message.author,
					message.channel,
				);

			await toplantıModel
				.find({})
				.sort({ toplantiId: "descending" })
				.exec(async (err, res) => {
					const newData = new toplantıModel({
						yetkili: message.author.id,
						active: true,
						type: "Genel",
						toplantiId: meetingNumber + 1,
						tarih: Date.now(),
					});
					await newData.save().catch((e) => console.error(e));
				});
			let roles = message.guild.roles.cache.get(
				`${server.BotCommandRole}`,
			);

			let yetkili = [
				...message.guild.members.cache
					.filter(
						(uye) =>
							!uye.user.bot &&
							uye.roles.highest.position >= roles.position,
					)
					.values(),
			];
			const embed = new Discord.EmbedBuilder()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL(),
				})
				.setColor("Random")
				.setTitle(`Toplantı Numarası: ${meetingNumber + 1}`)
				.setDescription(
					`Başarıyla genel toplantı <@&${
						server.BotCommandRole
					}> rolü ve üstündeki kullanıcılarıyla başlatıldı.\nToplantıya katılması beklenilen **${
						yetkili.length
					}** kişi!

Toplantı manuel olarak bitirilmediği takdirde **1.30** saat sonra otomatik olarak sonlanacak
Toplantıya katılmayanların listesini görüntülemek için \`.toplantı katılmayan ${
						meetingNumber + 1
					}\`
Toplantıyı bitirmek için \`.toplantı bitir ${meetingNumber + 1}\`
Toplantının ne zaman başladığını, bittiğini ve ne kadar sürdüğünü öğrenmek için \`.toplantı bilgi ${
						meetingNumber + 1
					}\``,
				);

			message.channel.send({ embeds: [embed] });

			yetkili.forEach(async (member) => {
				if (
					member.voice.channel &&
					member.voice.channel.id === server.MeetingChannel
				) {
					await member.roles.add(server.JoinMeetingRole);
				} else {
					if (
						server.JoinMeetingRole.some((x) =>
							member.roles.cache.has(x),
						)
					) {
						await member.roles.remove(server.JoinMeetingRole);
					}
				}
			});
		}
		if (args[0] === "yükseltim") {
			let toplantı = await toplantıModel.findOne({
				yetkili: message.author.id,
				type: "Yükseltim",
			});
			if (toplantı && toplantı.active == true)
				return client.send(
					`Zaten aktif bir yükseltim toplantınız mevcut \`.toplantı bitir ${toplantı.toplantiId}\` yaparak sonlandırabilirsin`,
					message.author,
					message.channel,
				);

			let msg = await message.channel.send({
				content: `Yükseltim toplantısı hangi rol(ler)deki yetkilileri kapsayacak?`,
				components: [rolerow],
			});
			var filter = (interaction) => interaction.user.id;
			const collector = msg.createMessageComponentCollector({
				filter,
				time: 30000,
			});

			collector.on("collect", async (interaction) => {
				rolerow.components[0].setDisabled(true);
				msg.edit({ components: [rolerow] });
				if (interaction.customId === "role_select") {
					interaction.deferUpdate();

					await toplantıModel
						.find({})
						.sort({ toplantiId: "descending" })
						.exec(async (err, res) => {
							const newData = new toplantıModel({
								yetkili: message.author.id,
								uyeler: interaction.values.map((id) => id),
								active: true,
								type: "Yükseltim",
								toplantiId: meetingNumber + 1,
								tarih: Date.now(),
							});
							await newData.save().catch((e) => console.error(e));
						});
					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL(),
						})
						.setColor("Random")
						.setTitle(`Toplantı Numarası: ${meetingNumber + 1}`)
						.setDescription(
							`Başarıyla yükseltim toplantısı ${interaction.values
								.map((id) => message.guild.roles.cache.get(id))
								.join(
									", ",
								)} rolündeki yetkililerle başlatıldı.\nToplantıya katılması beklenilen **${
								interaction.values.map((id) =>
									message.guild.roles.cache.get(id),
								).length
							}** kişi!

Toplantı manuel olarak bitirilmediği takdirde **1.30** saat sonra otomatik olarak sonlanacak
Toplantıya katılmayanların listesini görüntülemek için \`.toplantı katılmayan ${
								meetingNumber + 1
							}\`
Toplantıyı bitirmek için \`.toplantı bitir ${meetingNumber + 1}\`
Toplantının ne zaman başladığını, bittiğini ve ne kadar sürdüğünü öğrenmek için \`.toplantı bilgi ${
								meetingNumber + 1
							}\``,
						);

					message.channel.send({ embeds: [embed] });

					interaction.values.map(async (role) => {
						const members = interaction.guild.members.cache.filter(
							(member) =>
								member.roles.cache.some((x) =>
									role.includes(x.id),
								),
						);

						members.forEach(async (member) => {
							if (
								member.voice.channel &&
								member.voice.channel.id ===
									server.MeetingChannel
							) {
								await member.roles.add(server.JoinMeetingRole);
							} else {
								if (
									server.JoinMeetingRole.some((x) =>
										member.roles.cache.has(x),
									)
								) {
									await member.roles.remove(
										server.JoinMeetingRole,
									);
								}
							}
						});
					});
				}
			});
		}
	},
};
