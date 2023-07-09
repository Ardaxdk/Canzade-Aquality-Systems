const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const db = require("../../models/cantUnBan.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "svkontrol",
		usage: "svkontrol",
		category: "Owner",
		description: "Sunucu hakkındaki bilgileri görüntülersiniz",
		aliases: ["serverkontrol", "server-kontrol"],
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
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("rolemembers")
				.setLabel("Roldeki Kişiler")
				.setStyle(Discord.ButtonStyle.Success),
			new Discord.ButtonBuilder()
				.setCustomId("guildlogin")
				.setLabel("Sunucuya Giriş")
				.setStyle(Discord.ButtonStyle.Success),
		);
		const Administrator = message.guild.roles.cache.filter(
			(rol) =>
				rol.permissions.has(
					Discord.PermissionsBitField.Flags.Administrator,
				) && !rol.managed,
		);
		const GuildManage = message.guild.roles.cache.filter(
			(rol) =>
				rol.permissions.has(
					Discord.PermissionsBitField.Flags.ManageGuild,
				) && !rol.managed,
		);
		const RoleManage = message.guild.roles.cache.filter(
			(rol) =>
				rol.permissions.has(
					Discord.PermissionsBitField.Flags.ManageRoles,
				) && !rol.managed,
		);
		const ChannelManage = message.guild.roles.cache.filter(
			(rol) =>
				rol.permissions.has(
					Discord.PermissionsBitField.Flags.ManageChannels,
				) && !rol.managed,
		);
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.guild.name,
				iconURL: message.guild.iconURL(),
			})
			.setColor("Random")
			.addFields({
				name: "SUNUCU BİLGİLERİ",
				value: `
Taç Sahibi: ${message.guild.members.cache.get(message.guild.ownerId)}
Özel URL: ${
					message.guild.vanityURLCode
						? message.guild.vanityURLCode +
						  (await message.guild.fetchVanityData().uses)
						: "Özel URL Yok"
				}
Sunucu Kurulma Tarihi: <t:${Math.floor(message.guild.createdAt / 1000)}:R>
Rol Sayısı: **${message.guild.roles.cache.size}** - Kanal Sayısı: **${
					message.guild.channels.cache.size
				}**`,
			})
			.addFields({
				name: "ROL BİLGİLERİ",
				value: `
Yönetici Açık olan: **${Administrator.size}** rol
${Administrator.map((rol) => rol).join(",")}
--
Sunucuyu Yönet Açık olan: **${GuildManage.size}** rol
${GuildManage.map((rol) => rol).join(",")}
--
Rol Yönet Açık olan: **${RoleManage.size}** rol
${RoleManage.map((rol) => rol).join(",")}
--
Kanal Yönet Açık olan: **${ChannelManage.size}** rol
${ChannelManage.map((rol) => rol).join(",")}
`,
			});
		let msg = await message.reply({ embeds: [embed], components: [row] });

		var filter = (interaction) => interaction.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: 30000,
		});

		collector.on("collect", async (button) => {
			if (button.customId === "rolemembers") {
				row.components[0].setDisabled(true);
				msg.edit({ components: [row] });
				const embed = new Discord.EmbedBuilder()
					.setAuthor({
						name: message.guild.name,
						iconURL: message.guild.iconURL(),
					})
					.setColor("Random")
					.addFields({
						name: "ROL BİLGİLERİ",
						value: `
Yönetici rolü olan: **${
							message.guild.members.cache.filter(
								(uye) =>
									uye.permissions.has(
										Discord.PermissionsBitField.Flags
											.Administrator,
									) && !uye.user.bot,
							).size
						}** kişi
${message.guild.members.cache
	.filter(
		(uye) =>
			uye.permissions.has(
				Discord.PermissionsBitField.Flags.Administrator,
			) && !uye.user.bot,
	)
	.map((member) => member)
	.join(",")}
-----
Sunucuyu yönet rolü olan: **${
							message.guild.members.cache.filter(
								(uye) =>
									uye.permissions.has(
										Discord.PermissionsBitField.Flags
											.ManageGuild,
									) && !uye.user.bot,
							).size
						}** kişi
${message.guild.members.cache
	.filter(
		(uye) =>
			uye.permissions.has(
				Discord.PermissionsBitField.Flags.ManageGuild,
			) && !uye.user.bot,
	)
	.map((member) => member)
	.join(",")}
-----
Rol yönet rolü olan: **${
							message.guild.members.cache.filter(
								(uye) =>
									uye.permissions.has(
										Discord.PermissionsBitField.Flags
											.ManageRoles,
									) && !uye.user.bot,
							).size
						}** kişi
${message.guild.members.cache
	.filter(
		(uye) =>
			uye.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			) && !uye.user.bot,
	)
	.map((member) => member)
	.join(",")}
-----
Kanal yönet rolü olan: **${
							message.guild.members.cache.filter(
								(uye) =>
									uye.permissions.has(
										Discord.PermissionsBitField.Flags
											.ManageChannels,
									) && !uye.user.bot,
							).size
						}** kişi
${message.guild.members.cache
	.filter(
		(uye) =>
			uye.permissions.has(
				Discord.PermissionsBitField.Flags.ManageChannels,
			) && !uye.user.bot,
	)
	.map((member) => member)
	.join(",")}


    `,
					});
				button.reply({
					embeds: [embed],
				});
			} else if (button.customId === "guildlogin") {
				row.components[1].setDisabled(true);
				msg.edit({ components: [row] });
				const embed = new Discord.EmbedBuilder()
					.setAuthor({
						name: message.guild.name,
						iconURL: message.guild.iconURL(),
					})
					.setColor("Random").setDescription(`
Günlük giriş: **${
					message.guild.members.cache.filter(
						(member) =>
							Date.now() - member.joinedTimestamp < 86400000,
					).size
				}**
Haftalık giriş: **${
					message.guild.members.cache.filter(
						(member) =>
							Date.now() - member.joinedTimestamp < 604800000,
					).size
				}**
15 günlük giriş: **${
					message.guild.members.cache.filter(
						(member) =>
							Date.now() - member.joinedTimestamp < 1296000000,
					).size
				}**
1 aylık giriş: **${
					message.guild.members.cache.filter(
						(member) =>
							Date.now() - member.joinedTimestamp < 2592000000,
					).size
				}**`);
				button.reply({ embeds: [embed] });
			}
		});

		collector.on("end", async () => {
			row.components[0].setDisabled(true);
			row.components[1].setDisabled(true);
			msg.edit({ components: [row] });
		});
	},
};
