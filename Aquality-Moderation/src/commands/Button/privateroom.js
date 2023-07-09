const Discord = require("discord.js");
const serverSettings = require("../../models/serverSettings");
const PrivateModel = require("../../models/privateroom");
module.exports = {
	conf: {
		name: "private",
		usage: "private",
		category: "BotOwner",
		description: "Private oda sisteminin mesajını atar.",
		aliases: ["privateroom"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("ozel-oda")
				.setLabel("Özel oda oluştur")
				.setStyle(Discord.ButtonStyle.Secondary),
		);

		await message.channel.send({
			content: `
**Merhaba!** Secret odalar çok fazla yer kapladığı için onları sildik.

Bunun yerine aşağıdaki butondan sadece sana ait özel ses ve ses kanalını düzenleyebileceğin bir metin kanalı oluşturabilirsin.

**Unutma:** Özel odanda kimse bulunmadığında kanal 5 dakika sonra silinir, eğer istersen kanalını yeniden oluşturabilirsin.`,
			components: [row],
		});
	},
};

client.on("interactionCreate", async (interaction) => {
	let server = await serverSettings.findOne({
		guildID: interaction.guild.id,
	});
	if (interaction.customId === "ozel-oda") {
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
					.setCustomId("private")
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

	if (interaction.customId === "private-modal") {
		const CHANNEL_NAME = interaction.fields.getTextInputValue("name");
		const CHANNEL_LIMIT = interaction.fields.getTextInputValue("limit");
		const CHANNEL_PRIVATE = interaction.fields
			.getTextInputValue("private")
			.toLowerCase();

		if (await client.chatKoruma(CHANNEL_NAME))
			return interaction.reply({
				content:
					"kanal ismine küfür veya reklam yazamazsınız, devam ederseniz cezalandırılacaksınız.",
				ephemeral: true,
			});

		const overwrites = [
			{
				id: interaction.guild.roles.everyone,
				allow: [Discord.PermissionsBitField.Flags.ViewChannel],
			},
			{
				id: interaction.user.id,
				allow: [Discord.PermissionsBitField.Flags.ViewChannel],
			},
			{
				id: interaction.user.id,
				allow: [Discord.PermissionsBitField.Flags.Connect],
			},
		];
		if (CHANNEL_PRIVATE.startsWith("evet") || CHANNEL_PRIVATE === "evt") {
			overwrites.push({
				id: interaction.guild.roles.everyone,
				deny: [Discord.PermissionsBitField.Flags.Connect],
			});
		} else {
			overwrites.push({
				id: interaction.guild.roles.everyone,
				allow: [Discord.PermissionsBitField.Flags.Connect],
			});
		}
		const voiceChannel = await interaction.guild.channels.create({
			name: CHANNEL_NAME,
			type: Discord.ChannelType.GuildVoice,
			parent: server.SecretParent,
			userLimit: parseInt(CHANNEL_LIMIT) || 2,
			permissionOverwrites: overwrites,
		});
		const textChannel = await interaction.guild.channels.create({
			name: CHANNEL_NAME,
			type: Discord.ChannelType.GuildText,
			parent: server.SecretParent,
			userLimit: parseInt(CHANNEL_LIMIT) || 2,
			permissionOverwrites: [
				{
					id: interaction.guild.roles.everyone,
					deny: [Discord.PermissionsBitField.Flags.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [Discord.PermissionsBitField.Flags.ViewChannel],
				},
			],
		});

		const newModel = new PrivateModel({
			channelOwner: interaction.user.id,
			textChannelID: textChannel.id,
			voiceChannelID: voiceChannel.id,
			createDate: Date.now(),
		});
		await newModel.save().catch((e) => console.log(e));

		await interaction.reply({
			content: `Özel odanız oluşturuldu! Ses kanalı: ${voiceChannel} Metin kanalı: ${textChannel}`,
			ephemeral: true,
		});

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.StringSelectMenuBuilder()
				.setCustomId("private-room-edit")
				.setPlaceholder("Özel odanın ayarlarını düzenlemek için tıkla!")
				.addOptions([
					{
						label: "Kanal ayarlarını düzenle",
						description: "Özel odanızı yeniden düzenleyin.",
						value: "ozel-oda-edit",
					},
					{
						label: "Kanal bilgileri",
						description: "Özel odanızın bilgilerini düzenleyin.",
						value: "ozel-oda-bilgi",
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
		await textChannel.send({
			content: `
${client.emojis.cache.find((x) => x.name === "zadestat")} Merhaba ${
				interaction.member
			}! Kanalını (${voiceChannel}) yönetmek için aşağıdaki menüyü kullanabilirsin!

${client.emojis.cache.find(
	(x) => x.name === "secreticon",
)} Kanalın herkese açıksa, yasakladığın kullanıcılar odana giremez			
${client.emojis.cache.find(
	(x) => x.name === "secreticon",
)} Kanalın herkese kilitliyse, izin verdiğin kişiler dışında kimse giremez! (Yönetici permi olanlar dışında tabii ki :)) 

${client.emojis.cache.find(
	(x) => x.name === "secreticon2",
)} **5 dakika boyunca kanalda hiçbir kullanıcı bulunmazsa kanal otomatik olarak silinecektir.**
\`Lütfen kanala eklemek istediğin üye ID'lerini her defasında birer tane olacak şekilde yazınız. En fazla 6 kullanıcı ekleyebilirsiniz.\`
`,
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
		if (interaction.values[0] === "ozel-oda-bilgi") {
			const PrivateModal = await PrivateModel.findOne({
				channelOwner: interaction.user.id,
			});

			let voiceChannel = interaction.guild.channels.cache.get(
				PrivateModal.voiceChannelID,
			);
			interaction.reply({
				content: `

\`\`\`fix
Kanal Sahibi: ${interaction.user.username}
Kanal Adı: ${voiceChannel.name}
Kanal Limit: ${voiceChannel.userLimit}
Kanal Gizliliği: ${
					voiceChannel
						.permissionsFor(interaction.guild.id)
						.has(Discord.PermissionsBitField.Flags.Connect)
						? "Açık"
						: "Gizli"
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
			const private = new Discord.TextInputBuilder()
				.setCustomId("private-edit")
				.setLabel("Oda herkese gizli mi olacak?")
				.setPlaceholder("Örn: evet - hayır")
				.setRequired(false)
				.setMaxLength(5)
				.setStyle(Discord.TextInputStyle.Short);
			const userpermission = new Discord.TextInputBuilder()
				.setCustomId("permission-edit")
				.setLabel("Odaya girebilecek üye ID - isteğe bağlı")
				.setPlaceholder("Örn: 1040358584116068433")
				.setRequired(false)
				.setMaxLength(21)
				.setStyle(Discord.TextInputStyle.Short);

			const first = new Discord.ActionRowBuilder().addComponents(name);
			const second = new Discord.ActionRowBuilder().addComponents(limit);
			const third = new Discord.ActionRowBuilder().addComponents(private);
			const fourth = new Discord.ActionRowBuilder().addComponents(
				userpermission,
			);

			modal.addComponents(first, second, third, fourth);

			await interaction.showModal(modal);
		}
	}
	if (interaction.customId === "private-modal-edit") {
		const CHANNEL_NAME_EDIT =
			interaction.fields.getTextInputValue("name-edit");
		const CHANNEL_LIMIT_EDIT =
			interaction.fields.getTextInputValue("limit-edit");
		const CHANNEL_PRIVATE_EDIT =
			interaction.fields.getTextInputValue("private-edit");
		const CHANNEL_USER_PERMISSION_EDIT =
			interaction.fields.getTextInputValue("permission-edit");
		if (await client.chatKoruma(CHANNEL_NAME_EDIT))
			return interaction.reply({
				content:
					"kanal ismine küfür veya reklam yazamazsınız, devam ederseniz cezalandırılacaksınız.",
				ephemeral: true,
			});
		const PrivateModal = await PrivateModel.findOne({
			channelOwner: interaction.user.id,
		});

		let privatechannel = interaction.guild.channels.cache.get(
			PrivateModal.voiceChannelID,
		);

		privatechannel.edit({
			name: CHANNEL_NAME_EDIT || privatechannel.name,
			userLimit:
				parseInt(CHANNEL_LIMIT_EDIT) || 2 || privatechannel.userLimit,
		});

		if (CHANNEL_PRIVATE_EDIT == "evet") {
			privatechannel.permissionOverwrites.edit(interaction.guild.id, {
				Connect: false,
			});
		} else if (CHANNEL_PRIVATE_EDIT == "hayır") {
			privatechannel.permissionOverwrites.edit(interaction.guild.id, {
				Connect: true,
			});
		}
		if (
			CHANNEL_USER_PERMISSION_EDIT ==
			interaction.guild.members.cache.get(CHANNEL_USER_PERMISSION_EDIT)
		) {
			if (PrivateModal.channelUserPermission.length == 6)
				return interaction.reply({
					content: `Üzgünüm sadece 6 kişi ekleyebilirsin ve sen limitini doldurmuşsun.`,
					ephemeral: true,
				});

			if (
				PrivateModal.channelUserPermission.includes(
					CHANNEL_USER_PERMISSION_EDIT,
				)
			) {
				privatechannel.permissionOverwrites.delete(
					CHANNEL_USER_PERMISSION_EDIT,
				);
				await PrivateModel.findOneAndUpdate(
					{
						channelOwner: interaction.user.id,
					},
					{
						$pull: {
							channelUserPermission: CHANNEL_USER_PERMISSION_EDIT,
						},
					},
					{ upsert: true },
				);
			} else {
				privatechannel.permissionOverwrites.edit(
					CHANNEL_USER_PERMISSION_EDIT,
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
							channelUserPermission: CHANNEL_USER_PERMISSION_EDIT,
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
	}

	/*if (interaction.customId === "private-room") {
		if (interaction.values[0] === "ozel-oda") {
			/*	await PrivateModel.findOne(
				{
					channelOwner: interaction.user.id,
				},
				async (err, data) => {
					if (data)
						return interaction.reply({
							content: `Zaten bir özel odanız mevcut. Kanalınızı sildikten sonra yeniden deneyin.`,
							ephemeral: true,
						});
*/
	/*	const modal = new Discord.ModalBuilder()
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

			const first = new Discord.ActionRowBuilder().addComponents(name);
			const second = new Discord.ActionRowBuilder().addComponents(limit);
			const third = new Discord.ActionRowBuilder().addComponents(
				privateopen,
			);

			modal.addComponents(first, second, third);

			await interaction.showModal(modal);

			if (interaction.customId === "private-modal") {
				const CHANNEL_NAME =
					interaction.fields.getTextInputValue("name");
				const CHANNEL_LIMIT =
					interaction.fields.getTextInputValue("limit");
				const CHANNEL_PRIVATE =
					interaction.fields.getTextInputValue("private-open");

				// Cevapları kullanarak kanalları oluştur
				const overwrites = [
					{
						id: interaction.guild.roles.everyone,
						deny: [Discord.PermissionsBitField.Flags.ViewChannel],
					},
					{
						id: interaction.user.id,
						allow: [Discord.PermissionsBitField.Flags.ViewChannel],
					},
				];
				if (interaction.values[2].toLowerCase() === "evet") {
					overwrites.push({
						id: interaction.guild.roles.everyone,
						deny: [Discord.PermissionsBitField.Flags.Connect],
					});
				}
				const voiceChannel = await interaction.guild.channels.create({
					name: CHANNEL_NAME,
					type: Discord.ChannelType.GuildVoice,
					parent: server.SecretParent,
					userLimit: parseInt(CHANNEL_LIMIT) || 2,
					permissionOverwrites: overwrites,
				});
				const textChannel = await interaction.guild.channels.create({
					name: CHANNEL_NAME,
					type: Discord.ChannelType.GuildText,
					parent: server.SecretParent,
					userLimit: parseInt(CHANNEL_LIMIT) || 2,
					permissionOverwrites: overwrites,
				});

				await interaction.followUp({
					content: `Özel odanız oluşturuldu! Ses kanalı: ${voiceChannel} Metin kanalı: ${textChannel}`,
					ephemeral: true,
				});
			}
		}
	}*/
});
