const Discord = require("discord.js");
const { table } = require("table");
const PrivateModel = require("../models/privateroom");
const cezalar = require("../models/cezalar.js");
const mutes = require("../models/chatmute.js");
const notlar = require("../models/notlar.js");
const Cooldowns = new Discord.Collection();
const vmutes = require("../models/voicemute.js");
let serverSettings = require("../models/serverSettings");
const cezalar2 = require("../models/cezalı.js");
const isimler = require("../models/isimler.js");
const moment = require("moment");

module.exports = async (interaction) => {
	let server = await serverSettings.findOne({});
	/*if (interaction.customId === "private-room") {
		if (interaction.values[0] === "ozel-oda") {
			await PrivateModel.findOne(
				{
					channelOwner: interaction.user.id,
				},
				async (err, data) => {
					if (data)
						return interaction.reply({
							content: `Zaten bir özel odanız mevcut. Kanalınızı sildikten sonra yeniden deneyin.`,
							ephemeral: true,
						});

					const modal = new Discord.ModalBuilder()
						.setCustomId("private-modal")
						.setTitle("Özel Oda Sistemi");

					const name = new Discord.TextInputBuilder()
						.setCustomId("name")
						.setLabel("Oda ismi belirtmelisin.")
						.setPlaceholder("Örn: canzade's room")
						.setMinLength(4)
						.setMaxLength(15)
						.setRequired(true)
						.setStyle(Discord.TextInputStyle.Short);
					const limit = new Discord.TextInputBuilder()
						.setCustomId("limit")
						.setLabel("Oda limiti belirtmelisin.")
						.setPlaceholder("Örn: 1-99")
						.setMaxLength(2)
						.setRequired(true)
						.setStyle(Discord.TextInputStyle.Short);
					const privateopen = new Discord.TextInputBuilder()
						.setCustomId("private-open")
						.setLabel("Oda herkese gizli mi olacak?")
						.setPlaceholder("Örn: evet - hayır")
						.setMaxLength(5)
						.setRequired(true)
						.setStyle(Discord.TextInputStyle.Short);

					const first = new Discord.ActionRowBuilder().addComponents(
						name,
					);
					const second = new Discord.ActionRowBuilder().addComponents(
						limit,
					);
					const third = new Discord.ActionRowBuilder().addComponents(
						privateopen,
					);

					modal.addComponents(first, second, third);

					await interaction.showModal(modal);
				},
			);
		}
	}
	if (interaction.customId === "private-modal") {
		const channelname = interaction.fields.getTextInputValue("name");
		const channellimit = interaction.fields.getTextInputValue("limit");
		const channelprivate =
			interaction.fields.getTextInputValue("private-open");

		let textchannel = await interaction.guild.channels.create({
			name: channelname,
			type: Discord.ChannelType.GuildText,
			parent: server.SecretParent,
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [Discord.PermissionsBitField.Flags.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [Discord.PermissionsBitField.Flags.ViewChannel],
				},
			],
		});
		let voicechannel = await interaction.guild.channels.create({
			name: channelname,
			type: Discord.ChannelType.GuildVoice,
			userLimit: parseInt(channellimit) || 2,
			parent: server.SecretParent,
			permissionOverwrites: [
				channelprivate == "evet"
					? {
							id: interaction.guild.id,
							deny: [Discord.PermissionsBitField.Flags.Connect],
					  }
					: {
							id: interaction.guild.id,
							allow: [
								Discord.PermissionsBitField.Flags.Connect,
								Discord.PermissionsBitField.Flags.ViewChannel,
							],
					  },
				{
					id: interaction.user.id,
					allow: [
						Discord.PermissionsBitField.Flags.Connect,
						Discord.PermissionsBitField.Flags.ViewChannel,
					],
				},
			],
		});

		const newModel = new PrivateModel({
			channelOwner: interaction.user.id,
			textChannelID: textchannel.id,
			voiceChannelID: voicechannel.id,
			channelName: voicechannel.name,
			channelLimit: parseInt(channellimit) || 2,
			createDate: Date.now(),
			channelPrivate: channelprivate == "evet" ? "Gizli" : "Herkese Açık",
		});
		await newModel.save().catch((e) => console.log(e));

		await interaction.reply({
			content: `${interaction.member}, başarıyla kanalını oluşturdum. ${textchannel} göz atarak kanal ayarlarını düzenleyebilirsin.`,
			ephemeral: true,
		});

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.StringSelectMenuBuilder()
				.setCustomId("private-room-edit")
				.setPlaceholder("Özel odanın ayarlarını düzenlemek için tıkla!")
				.setMaxValues(2)
				.addOptions([
					{
						label: "Kanal ayarlarını düzenle",
						description: "Özel odanızı yeniden düzenleyin.",
						value: "ozel-oda-edit",
					},
					{
						label: "Kanala erişimi olan üye(ler)",
						description:
							"Kanala erişimi olan üyelerin listesini gönderir.",
						value: "channel-permission-user",
					},
					{
						label: "Kanalı sil",
						description: "Özel odanızı silersiniz.",
						value: "channel-delete",
					},
				]),
		);
		const privatemodel = await PrivateModel.findOne({
			channelOwner: interaction.user.id,
		});
		await textchannel.send({
			content: `
${interaction.member}, Özel odanı oluşturdum. <#${privatemodel.voiceChannelID}> tıklayarak ona ulaşabilirsin.
Kanalı silmek veya yeniden düzenlemek için aşağıdaki menüyü kullanman yeterli.

**7 dakika boyunca kanalda hiçbir kullanıcı bulunmazsa kanal otomatik olarak silinecektir.**
\`Lütfen kanala eklemek istediğin üye ID'lerini her defasında birer tane olacak şekilde yazınız. En fazla 6 kullanıcı ekleyebilirsiniz.\`
\`\`\`fix
Kanal Sahibi: ${interaction.user.username}
Kanal Adı: ${privatemodel.channelName}
Kanal Limit: ${privatemodel.channelLimit}
Kanal Durumu: ${privatemodel.channelPrivate}\`\`\``,
			components: [row],
		});
	}
	if (interaction.customId === "private-room-edit") {
		if (interaction.values[0] === "channel-delete") {
			let data = await PrivateModel.findOne({
				channelOwner: interaction.user.id,
			});

			if (
				interaction.guild.channels.cache.get(data.textChannelID) &&
				interaction.guild.channels.cache.get(data.textChannelID)
					?.deletable
			)
				interaction.guild.channels.cache
					.get(data.textChannelID)
					.delete();
			if (
				interaction.guild.channels.cache.get(data.voiceChannelID) &&
				interaction.guild.channels.cache.get(data.voiceChannelID)
					?.deletable
			)
				interaction.guild.channels.cache
					.get(data.voiceChannelID)
					.delete();

			await PrivateModel.deleteMany({
				channelOwner: interaction.user.id,
			});
		}
		if (interaction.values[0] === "channel-permission-user") {
			let data = await PrivateModel.findOne({
				channelOwner: interaction.user.id,
			});

			interaction.reply({
				content: `
Kullanıcının iznini kaldırmak istiyorsanız. Private Room Edit menüsünden **Odaya Girebilecek Üye ID** kısmından üyenin ID'sini yeniden yazın.\`\`\`css
${
	data.channelUserPermission.length > 0
		? data.channelUserPermission
				.map(
					(x) =>
						interaction.guild.members.cache.get(x).displayName +
						" - " +
						x,
				)
				.join("\n")
		: "Üye eklenmemiş"
} \`\`\``,
				ephemeral: true,
			});
		}

		if (interaction.values[0] === "ozel-oda-edit") {
			const modal = new Discord.ModalBuilder()
				.setCustomId("private-modal-edit")
				.setTitle("Özel Oda Düzenleme");

			const name = new Discord.TextInputBuilder()
				.setCustomId("name-edit")
				.setLabel("Yeni oda ismini belirtmelisin.")
				.setPlaceholder("Örn: canzade's room")
				.setRequired(false)
				.setMinLength(4)
				.setMaxLength(15)
				.setStyle(Discord.TextInputStyle.Short);
			const limit = new Discord.TextInputBuilder()
				.setCustomId("limit-edit")
				.setLabel("Yeni oda limitini belirtmelisin.")
				.setPlaceholder("Örn: 1-99")
				.setRequired(false)
				.setMaxLength(2)
				.setStyle(Discord.TextInputStyle.Short);
			const privateopen = new Discord.TextInputBuilder()
				.setCustomId("private-open-edit")
				.setLabel("Oda herkese gizli mi olacak?")
				.setPlaceholder("Örn: evet - hayır")
				.setRequired(false)
				.setMaxLength(5)
				.setStyle(Discord.TextInputStyle.Short);
			const permission = new Discord.TextInputBuilder()
				.setCustomId("permission-edit")
				.setLabel("Odaya girebilecek üye ID - isteğe bağlı")
				.setPlaceholder("Örn: 1040358584116068433")
				.setRequired(false)
				.setMaxLength(21)
				.setStyle(Discord.TextInputStyle.Short);

			const first = new Discord.ActionRowBuilder().addComponents(name);
			const second = new Discord.ActionRowBuilder().addComponents(limit);
			const third = new Discord.ActionRowBuilder().addComponents(
				privateopen,
			);
			const fourth = new Discord.ActionRowBuilder().addComponents(
				permission,
			);

			modal.addComponents(first, second, third, fourth);

			await interaction.showModal(modal);
		}
	}
	if (interaction.customId === "private-modal-edit") {
		const channelnameedit =
			interaction.fields.getTextInputValue("name-edit");
		const channellimitedit =
			interaction.fields.getTextInputValue("limit-edit");
		const channelprivateedit =
			interaction.fields.getTextInputValue("private-open-edit");
		const channelpermissionedit =
			interaction.fields.getTextInputValue("permission-edit");

		const PrivateModal = await PrivateModel.findOne({
			channelOwner: interaction.user.id,
		});

		let privatechannel = interaction.guild.channels.cache.get(
			PrivateModal.voiceChannelID,
		);

		if (channelnameedit !== PrivateModal.channelName) {
			privatechannel.setName(channelnameedit || PrivateModal.channelName);
		}

		if (channelprivateedit == "evet") {
			privatechannel.permissionOverwrites.edit(interaction.guild.id, {
				Connect: false,
			});
		} else if (channelprivateedit == "hayır") {
			privatechannel.permissionOverwrites.edit(interaction.guild.id, {
				Connect: true,
			});
		}

		if (channellimitedit !== PrivateModal.channelLimit) {
			privatechannel.setUserLimit(parseInt(channellimitedit) || 2);
		}

		if (
			channelpermissionedit ==
			interaction.guild.members.cache.get(channelpermissionedit)
		) {
			if (PrivateModal.channelUserPermission.length == 6)
				return interaction.reply({
					content: `Üzgünüm sadece 6 kişi ekleyebilirsin ve sen limitini doldurmuşsun.`,
					ephemeral: true,
				});

			if (
				PrivateModal.channelUserPermission.includes(
					channelpermissionedit,
				)
			) {
				privatechannel.permissionOverwrites.delete(
					channelpermissionedit,
				);
				await PrivateModel.findOneAndUpdate(
					{
						channelOwner: interaction.user.id,
					},
					{
						$pull: {
							channelUserPermission: channelpermissionedit,
						},
					},
					{ upsert: true },
				);
			} else {
				privatechannel.permissionOverwrites.edit(
					channelpermissionedit,
					{
						Connect: true,
						ViewChannel: true,
					},
				);
				await PrivateModel.findOneAndUpdate(
					{
						channelOwner: interaction.user.id,
					},
					{
						$push: {
							channelUserPermission: channelpermissionedit,
						},
					},
					{ upsert: true },
				);
			}
		}

		interaction.reply({
			content: `${interaction.member}, kanal ayarlarını başarıyla güncelledim.`,
			ephemeral: true,
		});
	}*/
	if (interaction.customId === "memberJoinedServer") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);
		interaction.reply({
			content: `${moment(interaction.member.joinedAt).format("LLL")}`,
			ephemeral: true,
		});
	} else if (interaction.customId === "historyName") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);
		isimler.findOne({ user: interaction.user.id }, async (err, res) => {
			if (!res)
				return interaction.reply({
					content: "Geçmiş isimleriniz bulunamadı.",
					ephemeral: true,
				});
			const zaa = new Discord.EmbedBuilder()
				.setAuthor({
					name: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL({
						dynamic: true,
					}),
				})
				.setDescription(
					`
Toplam da ${res.isimler.length} isim kayıtınız bulundu:
	
${res.isimler.map((x) => `\`• ${x.isim}\` (${x.state})`).join("\n")}`,
				)
				.setColor("Random");
			interaction.reply({ embeds: [zaa], ephemeral: true });
		});
	} else if (interaction.customId === "activePenalties") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);

		let mute = "";
		let vmute = "";
		let cezalı = "";
		await cezalar2.findOne(
			{ user: interaction.user.id },
			async (err, doc) => {
				if (!doc) {
					cezalı = "Veritabanında cezalı bilgisi bulunmamakta.";
				} else {
					if (doc.ceza == false) {
						cezalı = "Veritabanında cezalı bilgisi bulunmamakta.";
					} else if (doc.ceza == true) {
						cezalı =
							"Cezalı Atan Yetkili: <@" +
							client.users.cache.get(doc.yetkili) +
							">\nCeza Sebebi: `" +
							doc.sebep +
							"`\nCeza Tarihi: `" +
							doc.tarih +
							"`\nCeza Bitiş: `" +
							moment(doc.bitis).format("LLL") +
							"`";
					}
				}
			},
		);
		await mutes.findOne({ user: interaction.user.id }, async (err, doc) => {
			if (!doc) {
				mute = "Veritabanında chat mute bilgisi bulunmamakta.";
			} else {
				if (doc.muted == false) {
					mute = "Veritabanında chat mute bilgisi bulunmamakta.";
				} else if (doc.muted == true) {
					mute =
						"Mute Atan Yetkili: <@" +
						client.users.cache.get(doc.yetkili) +
						">\nMute Sebebi: `" +
						doc.sebep +
						"`\nMute Başlangıç: `" +
						moment(doc.start).format("LLL") +
						"`\nMute Bitiş: `" +
						moment(doc.endDate).format("LLL") +
						"`";
				}
			}
		});
		await vmutes.findOne(
			{ user: interaction.user.id },
			async (err, doc) => {
				if (!doc) {
					vmute = "Veritabanında ses mute bilgisi bulunmamakta.";
				} else {
					if (doc.muted == false) {
						vmute = "Veritabanında ses mute bilgisi bulunmamakta.";
					} else if (doc.muted == true) {
						vmute =
							"Mute Atan Yetkili: <@" +
							client.users.cache.get(doc.yetkili) +
							">\nMute Sebebi: `" +
							doc.sebep +
							"`\nMute Başlangıç: `" +
							moment(doc.start).format("LLL") +
							"`\nMute Bitiş: `" +
							moment(doc.endDate).format("LLL") +
							"`";
					}
				}
			},
		);
		interaction.reply({
			content: `
Ceza bilgileriniz aşağıda belirtilmiştir.

\` • \` Cezalı Bilgisi;
${cezalı || "Veritabanında aktif cezalı bilgisi bulunmamakta."}

\` • \` Chat Mute Bilgisi;
${mute || "Veritabanında aktif chat mute bilgisi bulunmamakta."}

\` • \` Voice Mute Bilgisi;
${vmute || "Veritabanında aktif voice mute bilgisi bulunmamakta."}

`,
			ephemeral: true,
		});
	} else if (interaction.customId === "penaltyPoints") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);
		let puan = await client.punishPoint(interaction.user.id);
		interaction.reply({
			content: `${interaction.user}: ` + puan + ` ceza puanı`,
			ephemeral: true,
		});
	} else if (interaction.customId === "historyPenalties") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);
		await cezalar
			.find({ user: interaction.user.id })
			.sort({ ihlal: "descending" })
			.exec(async (err, res) => {
				let datax = [["ID", "Tarih", "Ceza", "Sebep"]];

				let dataxe = [
					["ID", "Ceza", "Tarih", "Bitiş", "Yetkili", "Sebep"],
				];

				let config = {
					border: {
						topBody: ``,
						topJoin: ``,
						topLeft: ``,
						topRight: ``,

						bottomBody: ``,
						bottomJoin: ``,
						bottomLeft: ``,
						bottomRight: ``,

						bodyLeft: `│`,
						bodyRight: `│`,
						bodyJoin: `│`,

						joinBody: ``,
						joinLeft: ``,
						joinRight: ``,
						joinJoin: ``,
					},
				};
				res.map((x) => {
					datax.push([x.ihlal, x.tarih, x.ceza, x.sebep]);
				});
				let cezaSayi = datax.length - 1;
				if (cezaSayi == 0)
					return interaction.reply({
						content: `Ceza bilginiz bulunamadı.
						`,
						ephemeral: true,
					});

				res.map((x) => {
					dataxe.push([
						x.ihlal,
						x.ceza,
						x.tarih,
						x.bitiş,
						client.users.cache.get(x.yetkili).username,
						x.sebep,
					]);
				});

				let outi = table(datax.slice(0, 15), config);
				interaction.reply({
					content:
						"<@" +
						interaction.user.id +
						"> toplam " +
						cezaSayi +
						" cezanız bulunmakta son 15 ceza aşağıda belirtilmiştir. ```fix\n" +
						outi +
						"\n``` ",
					ephemeral: true,
				});
			});
	} else if (interaction.customId === "notes") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);
		await notlar.findOne(
			{ user: interaction.user.id },
			async (err, res) => {
				if (!res)
					return interaction.reply({
						content: "Sistemde kayıtlı notunuz bulunmamaktadır.",
						ephemeral: true,
					});
				const notes = new Discord.EmbedBuilder()
					.setAuthor({
						name: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({
							dynamic: true,
						}),
					})
					.setDescription(
						`🚫 <@${
							interaction.user.id
						}> ceza notlarınız aşağıda belirtilmiştir.\n\n${res.notlar
							.map(
								(x) =>
									`- Not Bırakan <@${x.yetkili}> | (\`${x.yetkili}\`)\n- Not: \`${x.not}\``,
							)
							.join("\n\n")}`,
						{ split: true },
					)
					.setColor("Random");
				let notlarıms = res.notlar.map(
					(x) =>
						`• Not Bırakan Yetkili: <@${x.yetkili}> | (\`${x.yetkili}\`)\n• Not: \`${x.not}\``,
				);
				const MAX_CHARS = 3 + 2 + notlar.length + 3;
				if (MAX_CHARS < 2000) {
					const cann = new Discord.EmbedBuilder()
						.setAuthor({
							name: interaction.user.username,
							iconURL: interaction.user.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setDescription(
							`🚫 <@${
								interaction.user.id
							}> ceza notlarınız çok fazla olduğundan dolayı son 10 not aşağıda belirtilmiştir.\n\n${notlarıms
								.reverse()
								.join("\n\n")}`,
						)
						.setColor("Random");
					interaction.reply({ embeds: [cann], ephemeral: true });
				} else {
					interaction.reply({ embeds: [notes], ephemeral: true });
				}
			},
		);
	} else if (interaction.customId === "penaltiesNumber") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);

		await cezalar
			.find({ user: interaction.user.id })
			.sort({ ihlal: "descending" })
			.exec(async (err, res) => {
				let filterArr = [];
				res.map((x) => filterArr.push(x.ceza));
				let chatMute =
					filterArr.filter((x) => x == "Chat Mute").length || 0;
				let voiceMute =
					filterArr.filter((x) => x == "Voice Mute").length || 0;
				let jail = filterArr.filter((x) => x == "Cezalı").length || 0;
				let puan = await client.punishPoint(interaction.user.id);
				let cezasayı = await client.cezasayı(interaction.user.id);
				let warn = filterArr.filter((x) => x == "Uyarı").length || 0;

				const embed = new Discord.EmbedBuilder().setAuthor({
					name: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL({
						dynamic: true,
					}),
				}).setDescription(`Ceza sayılarınız aşağıda belirtilmiştir.
					
${chatMute} Chat Mute, ${voiceMute} Voice Mute, ${jail} Cezalı ve ${warn} Uyarı.

_Ceza Puanı_ : **${puan}**`);

				interaction.reply({ embeds: [embed], ephemeral: true });
			});
	} else if (interaction.customId === "memberRoles") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);
		const roles = interaction.member.roles.cache
			.filter((role) => role.id !== interaction.guild.id)
			.sort((a, b) => b.position - a.position)
			.map((role) => `<@&${role.id}>`);
		const rolleri = [];
		if (roles.length > 50) {
			const lent = roles.length - 50;
			let itemler = roles.slice(0, 50);
			itemler.map((x) => rolleri.push(x));
			rolleri.push(`${lent} daha...`);
		} else {
			roles.map((x) => rolleri.push(x));
		}

		const embed = new Discord.EmbedBuilder()
			.setColor("Random")
			.setDescription(
				"Üzerinizdeki roller aşağıda belirtilmiştir. (" +
					roles.length +
					" tane): " +
					"\n " +
					rolleri.join(", ") +
					" ",
			);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	} else if (interaction.customId === "createdAt") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);
		await interaction.reply({
			content:
				"Hesap oluşturulma tarihiniz: " +
				moment(interaction.user.createdTimestamp).format("LLL") +
				"",
			ephemeral: true,
		});
	}
};

module.exports.conf = {
	name: "interactionCreate",
};
