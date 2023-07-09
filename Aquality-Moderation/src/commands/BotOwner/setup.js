const Discord = require("discord.js");
const serverData = require("../../models/serverSettings");
const { max } = require("moment");
module.exports = {
	conf: {
		name: "setup",
		usage: "kur [settings]",
		category: "BotOwner",
		description: "Bot-Sunucu kurulumunu tamamlamaya yarar",
		aliases: ["kur"],
	},

	async run(client, message, args) {
		if (!client.settings.BOT_OWNERS.includes(message.author.id)) return;
		let choose = args[0];

		if (!choose) {
			let ayar = await serverData.findOne({ guildID: message.guild.id });
			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.StringSelectMenuBuilder()
					.setCustomId("setup")
					.setPlaceholder("Ayar kategorilerini seç")
					.addOptions([
						{
							label: "Sunucu Ayar",
							value: "guild-settings",
						},
						{
							label: "Rol Ayar",
							value: "role-settings",
						},
						{
							label: "Kanal Ayar",
							value: "channel-settings",
						},
						{
							label: "Stat Ayar",
							value: "stat-settings",
						},
						{
							label: "Invite Ayar",
							value: "invite-settings",
						},
					]),
			);

			const embed = new Discord.EmbedBuilder()
				.setAuthor({
					name: message.guild.name,
					iconURL: message.guild.iconURL(),
				})
				.setDescription(
					`
\`BOT SETTINGS\`
**Bot Owner:** (${
						ayar.BotOwner.length > 0
							? `${ayar.BotOwner.map((x) => `<@${x}>`).join(",")}`
							: "`YOK`"
					})
**Kayıt Sistemi:** (${
						ayar.RegisterSystem
							? client.emojis.cache.find(
									(x) =>
										x.name ==
										client.settings.emojis.yes_name,
							  )
							: client.emojis.cache.find(
									(x) =>
										x.name ==
										client.settings.emojis.no_name,
							  )
					})
**Taglı Alım:** (${
						ayar.TaggedMode
							? client.emojis.cache.find(
									(x) =>
										x.name ==
										client.settings.emojis.yes_name,
							  )
							: client.emojis.cache.find(
									(x) =>
										x.name ==
										client.settings.emojis.no_name,
							  )
					})
**İstila Koruması:** (${
						ayar.AUTO_ROLE
							? client.emojis.cache.find(
									(x) =>
										x.name ==
										client.settings.emojis.yes_name,
							  )
							: client.emojis.cache.find(
									(x) =>
										x.name ==
										client.settings.emojis.no_name,
							  )
					})`,
				)

				.setColor("Random")
				.setThumbnail(message.guild.iconURL({ dynamic: true }));
			let msg = await message.channel.send({
				embeds: [embed],
				components: [row],
			});
			var filter = (interaction) => interaction.user.id;
			const collector = msg.createMessageComponentCollector({
				filter,
				time: 60000,
			});

			collector.on("collect", async (interaction) => {
				if (interaction.customId === "setup") {
					if (interaction.values[0] === "guild-settings") {
						const embed = new Discord.EmbedBuilder()
							.setAuthor({
								name: message.guild.name,
								iconURL: message.guild.iconURL(),
							})
							.setDescription(
								`
\`GUILD SETTINGS\`
**Guild Owner:** (${
									ayar.GuildOwner.length > 0
										? `${ayar.GuildOwner.map(
												(x) => `<@${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Tag:** (${ayar.Tag ? ayar.Tag : "`YOK`"}) / (${
									ayar.SecondaryTag
										? ayar.SecondaryTag
										: "`YOK`"
								})
**Link:** (${ayar.Link ? ayar.Link : "`YOK`"})`,
							)

							.setColor("Random")
							.setThumbnail(
								message.guild.iconURL({ dynamic: true }),
							);
						interaction.reply({ embeds: [embed], ephemeral: true });
					}
					if (interaction.values[0] === "role-settings") {
						const embed = new Discord.EmbedBuilder()
							.setAuthor({
								name: message.guild.name,
								iconURL: message.guild.iconURL(),
							})
							.setDescription(
								`
\`PERM SETTINGS\`
**Register auth:** (${
									ayar.RegisterAuth.length > 0
										? `${ayar.RegisterAuth.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Senior official:** (${
									ayar.SeniorOfficial.length > 0
										? `${ayar.SeniorOfficial.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Owner auth:** (${
									ayar.OwnerRole.length > 0
										? `${ayar.OwnerRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})					
**Bot command auth:** (${
									ayar.BotCommandRole.length > 0
										? `${ayar.BotCommandRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Ban auth:** (${
									ayar.BanAuth.length > 0
										? `${ayar.BanAuth.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Jail auth:** (${
									ayar.JailAuth.length > 0
										? `${ayar.JailAuth.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Chat mute auth:** (${
									ayar.ChatMuteAuth.length > 0
										? `${ayar.ChatMuteAuth.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Voice mute auth:** (${
									ayar.VoiceMuteAuth.length > 0
										? `${ayar.VoiceMuteAuth.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Solving auth:** (${
									ayar.SolvingAuth.length > 0
										? `${ayar.SolvingAuth.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})					
**Role manage auth:** (${
									ayar.RoleManageAuth.length > 0
										? `${ayar.RoleManageAuth.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Move auth:** (${
									ayar.MoveAuth.length > 0
										? `${ayar.MoveAuth.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Sorumluluk rolleri:** (${
									ayar.ResbonsibilityRole.length > 0
										? `${ayar.ResbonsibilityRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Başlangıç yetkileri:** (${
									ayar.BeginningRole.length > 0
										? `${ayar.BeginningRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})								
	
\`ROLE SETTINGS\`
**Man role:** (${
									ayar.ManRole.length > 0
										? `${ayar.ManRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Woman role:** (${
									ayar.WomanRole.length > 0
										? `${ayar.WomanRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Unregistered role:** (${
									ayar.UnregisteredRole.length > 0
										? `${ayar.UnregisteredRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Family role:** (${
									ayar.FamilyRole.length > 0
										? `${ayar.FamilyRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Suspected role:** (${
									ayar.SuspectedRole.length > 0
										? `${ayar.SuspectedRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Booster role:** (${
									ayar.BoosterRole.length > 0
										? `${ayar.BoosterRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Vip role:** (${
									ayar.VipRole.length > 0
										? `${ayar.VipRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Quarantine role:** (${
									ayar.QuarantineRole.length > 0
										? `${ayar.QuarantineRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Chat mute role:** (${
									ayar.ChatMuteRole.length > 0
										? `${ayar.ChatMuteRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Warn role one:** (${
									ayar.WarnRoleOne.length > 0
										? `${ayar.WarnRoleOne.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Warn role two:** (${
									ayar.WarnRoleOne.length > 0
										? `${ayar.WarnRoleTwo.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Warn role three:** (${
									ayar.WarnRoleOne.length > 0
										? `${ayar.WarnRoleThree.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Banned tag role:** (${
									ayar.BannedTagRole.length > 0
										? `${ayar.BannedTagRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Join meeting role:** (${
									ayar.JoinMeetingRole.length > 0
										? `${ayar.JoinMeetingRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})
**Stream punitive role:** (${
									ayar.StreamPunitiveRole.length > 0
										? `${ayar.StreamPunitiveRole.map(
												(x) => `<@&${x}>`,
										  ).join(",")}`
										: "`YOK`"
								})`,
							)

							.setColor("Random")
							.setThumbnail(
								message.guild.iconURL({ dynamic: true }),
							);
						interaction.reply({ embeds: [embed], ephemeral: true });
					}
					if (interaction.values[0] === "channel-settings") {
						const embed = new Discord.EmbedBuilder()
							.setTitle(
								`Kanal Ayar`,
								message.author.avatarURL({ dynamic: true }),
							)
							.setDescription(
								`
\`CHANNEL SETTINGS\`
**General chat:** (${
									ayar.GeneralChat.length
										? `<#${ayar.GeneralChat}>`
										: "`YOK`"
								})
**Register chat:** (${
									ayar.RegisterChat.length
										? `<#${ayar.RegisterChat}>`
										: "`YOK`"
								})
**Register parent:** (${
									ayar.RegisterParent.length
										? `<#${ayar.RegisterParent}>`
										: "`YOK`"
								})					
**Public parent:** (${
									ayar.PublicParent.length
										? `<#${ayar.PublicParent}>`
										: "`YOK`"
								})
**Secret parent:** (${
									ayar.SecretParent.length
										? `<#${ayar.SecretParent}>`
										: "`YOK`"
								})
**Solving chat:** (${
									ayar.SolvingChat.length
										? `<#${ayar.SolvingChat}>`
										: "`YOK`"
								})
**Solving parent:** (${
									ayar.SolvingParent.length
										? `<#${ayar.SolvingParent}>`
										: "`YOK`"
								})
**Meeting channel:** (${
									ayar.MeetingChannel.length
										? `<#${ayar.MeetingChannel}>`
										: "`YOK`"
								})
**Stream channel:** (${
									ayar.StreamParent.length
										? `<#${ayar.StreamParent}>`
										: "`YOK`"
								})
**Afk Room:** (${ayar.AFKRoom.length ? `<#${ayar.AFKRoom}>` : "`YOK`"})

\`LOG SETTINGS\`
**Ban log:** (${ayar.BanLog.length ? `<#${ayar.BanLog}>` : "`YOK`"})
**Jail log:** (${ayar.JailLog.length ? `<#${ayar.JailLog}>` : "`YOK`"})
**Chat mute log:** (${
									ayar.ChatMuteLog.length
										? `<#${ayar.ChatMuteLog}>`
										: "`YOK`"
								})
**Voice mute log:** (${
									ayar.VoiceMuteLog.length
										? `<#${ayar.VoiceMuteLog}>`
										: "`YOK`"
								})
**Penalty point log:** (${
									ayar.PenaltyPointLog.length
										? `<#${ayar.PenaltyPointLog}>`
										: "`YOK`"
								})
**Unban log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name === "unban-log",
									) ?? "`YOK`"
								})
**Command block log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name === "command-block",
									) ?? "`YOK`"
								})
**Role manage log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name === "rol-yönet",
									) ?? "`YOK`"
								})
**Join family log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name === "join-family",
									) ?? "`YOK`"
								})
**Leave family log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name === "leave-family",
									) ?? "`YOK`"
								})
**Authy leave log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name === "yetkili-tag",
									) ?? "`YOK`"
								})
**Remove punishment log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name ===
											"sağ-tık-ceza-işlem",
									) ?? "`YOK`"
								})
**Banned tag log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name === "yasaklı-tag",
									) ?? "`YOK`"
								})
**Stream punitive log:** (${
									client.channels.cache.find(
										(channel) =>
											channel.name === "stream-cezalı",
									) ?? "`YOK`"
								})`,
							)

							.setColor("Random")
							.setThumbnail(
								message.guild.iconURL({ dynamic: true }),
							);
						interaction.reply({ embeds: [embed], ephemeral: true });
					}
					if (interaction.values[0] === "stat-settings") {
						const embed = new Discord.EmbedBuilder()
							.setTitle(
								`Stat Ayar`,
								message.author.avatarURL({ dynamic: true }),
							)
							.setDescription(
								`
\`CHANNEL SETTINGS\`
**Leaderboard channel:** (${
									ayar.LeaderboardChannel.length
										? `<#${ayar.LeaderboardChannel}>`
										: "`YOK`"
								})
**Reward channel:** (${
									ayar.RewardChannel.length
										? `<#${ayar.RewardChannel}>`
										: "`YOK`"
								})
`,
							)

							.setColor("Random")
							.setThumbnail(
								message.guild.iconURL({ dynamic: true }),
							);
						interaction.reply({ embeds: [embed], ephemeral: true });
					}
					if (interaction.values[0] === "invite-settings") {
						const embed = new Discord.EmbedBuilder()
							.setTitle(
								`Invite Ayar`,
								message.author.avatarURL({ dynamic: true }),
							)
							.setDescription(
								`
\`CHANNEL SETTINGS\`
**Invite log:** (${ayar.InviteLog.length ? `<#${ayar.InviteLog}>` : "`YOK`"})
**Rules channel:** (${
									ayar.RulesChannel.length
										? `<#${ayar.RulesChannel}>`
										: "`YOK`"
								})
`,
							)

							.setColor("Random")
							.setThumbnail(
								message.guild.iconURL({ dynamic: true }),
							);
						interaction.reply({ embeds: [embed], ephemeral: true });
					}
				}
			});
		}

		let canzade = await serverData.findOne({ guildID: message.guild.id });

		//#region Bot

		if (["botowner"].some((x) => x === choose)) {
			setup("BotOwner", "Bot Owner", "user");
		}

		//#endregion Bot

		//#region Guild

		if (["guildowner"].some((x) => x === choose)) {
			setup("GuildOwner", "Kurucuları", "user");
		}

		if (["tag"].some((x) => x === choose)) {
			let select = args[1];
			if (!select)
				return client.send(
					`Sunucunun tagını belirtmelisin`,
					message.author,
					message.channel,
				);
			(canzade.Tag = select),
				await canzade.save(),
				client.send(
					`Sunucu tagı başarıyla ${select} olarak ayarlandı`,
					message.author,
					message.channel,
				);
		}

		if (
			["secondarytag", "secondary-tag", "ikincitag"].some(
				(x) => x === choose,
			)
		) {
			let select = args[1];
			if (!select)
				return client.send(
					`Sunucunun ikinci tagını belirtmelisin`,
					message.author,
					message.channel,
				);
			(canzade.SecondaryTag = select),
				await canzade.save(),
				client.send(
					`Sunucu ikinci tagı başarıyla ${select} olarak ayarlandı`,
					message.author,
					message.channel,
				);
		}

		if (["link"].some((x) => x === choose)) {
			let select = args[1];
			if (!select)
				return client.send(
					`Sunucunun linkini belirtmelisin`,
					message.author,
					message.channel,
				);
			(canzade.Link = select),
				await canzade.save(),
				client.send(
					`Sunucunu linki başarıyla ${select} olarak ayarlandı`,
					message.author,
					message.channel,
				);
		}

		//#endregion Guild

		//#region Permissions

		if (["registerauth", "kayıtyetkili"].some((x) => x === choose)) {
			setup("RegisterAuth", "Register Yetkili", "role");
		}

		if (
			["seniorofficial", "ustyetkili", "üstyetkili"].some(
				(x) => x === choose,
			)
		) {
			setup("SeniorOfficial", "Üst Yetkili", "role");
		}

		if (
			[
				"ownerauth",
				"ownerrole",
				"ownerrol",
				"kurucurol",
				"kurucurolü",
			].some((x) => x === choose)
		) {
			setup("OwnerRole", "Owner Rolü", "role");
		}

		if (
			["botcommandauth", "botcommandrole", "botcommandsrole"].some(
				(x) => x === choose,
			)
		) {
			setup("BotCommandRole", "Bot Komut Rolü", "role");
		}

		if (["banauth"].some((x) => x === choose)) {
			setup("BanAuth", "Ban Yetkili", "role");
		}

		if (["jailauth"].some((x) => x === choose)) {
			setup("JailAuth", "Jail Yetkili", "role");
		}

		if (["chatmuteauth"].some((x) => x === choose)) {
			setup("ChatMuteAuth", "Chat mute Yetkili", "role");
		}

		if (["voicemuteauth"].some((x) => x === choose)) {
			setup("VoiceMuteAuth", "Voice mute Yetkili", "role");
		}

		if (["solvingauth"].some((x) => x === choose)) {
			setup("SolvingAuth", "Sorun çözme Yetkili", "role");
		}

		if (["rolemanageauth"].some((x) => x === choose)) {
			setup("RoleManageAuth", "Role yönet Yetkili", "role");
		}

		if (["moveauth"].some((x) => x === choose)) {
			setup("MoveAuth", "Transport Yetkili", "role");
		}
		if (["sorumlulukrolleri", "sorumluluk"].some((x) => x === choose)) {
			setup("ResbonsibilityRole", "Sorumluluk", "role");
		}
		if (["baslangic", "başlangıc", "beginning"].some((x) => x === choose)) {
			setup("BeginningRole", "Sorumluluk", "role");
		}
		//#endregion Permissions

		//#region Role

		if (["manrole", "erkekrolü", "erkekrol"].some((x) => x === choose)) {
			setup("ManRole", "Erkek", "role");
		}

		if (["womanrole", "kadınrolü", "kadınrol"].some((x) => x === choose)) {
			setup("WomanRole", "Kadın", "role");
		}

		if (
			["kayıtsızrolü", "unregisteredrole", "unregisterrole"].some(
				(x) => x === choose,
			)
		) {
			setup("UnregisteredRole", "Kayıtsız", "role");
		}

		if (["familyrole", "taglırolü", "tagrolü"].some((x) => x === choose)) {
			setup("FamilyRole", "Aile", "role");
		}

		if (
			["şüphelirolü", "suspectedrole", "suspectrole", "şüphelirol"].some(
				(x) => x === choose,
			)
		) {
			setup("SuspectedRole", "Şüpheli Hesap", "role");
		}

		if (
			["boosterrolü", "boosterrole", "booster"].some((x) => x === choose)
		) {
			setup("BoosterRole", "Booster", "role");
		}

		if (["viprolü", "vip", "viprole"].some((x) => x === choose)) {
			setup("VipRole", "Vip", "role");
		}

		if (
			[
				"quarantinerole",
				"karantinarolü",
				"karantinarole",
				"cezalırolü",
			].some((x) => x === choose)
		) {
			setup("QuarantineRole", "Karantina", "role");
		}

		if (["chatmuterole", "chatmutedrole"].some((x) => x === choose)) {
			setup("ChatMuteRole", "Mute", "role");
		}

		if (["warnroleone"].some((x) => x === choose)) {
			setup("WarnRoleOne", "1. Uyarı", "role");
		}

		if (["warnroletwo"].some((x) => x === choose)) {
			setup("WarnRoleTwo", "2. Uyarı", "role");
		}

		if (["warnrolethree"].some((x) => x === choose)) {
			setup("WarnRoleThree", "3. Uyarı", "role");
		}

		if (
			[
				"yasaklıtagrole",
				"yasaklıtagrole",
				"bannedtagrol",
				"yasaklıtagrolü",
				"bannedtagrole",
			].some((x) => x === choose)
		) {
			setup("BannedTagRole", "Yasaklı tag", "role");
		}

		if (
			["joinmeetingrole", "joinmeetrole", "katıldırolü"].some(
				(x) => x === choose,
			)
		) {
			setup("JoinMeetingRole", "katıldı", "role");
		}

		if (["streampunitiverole"].some((x) => x === choose)) {
			setup("StreamPunitiveRole", "Stream cezalı", "role");
		}
		//#endregion Role

		//#region Channel

		if (
			["generalchat", "chatkanalı", "chatkanali", "genelchat"].some(
				(x) => x === choose,
			)
		) {
			setup("GeneralChat", "Genel chat kanalı", "channel");
		}

		if (
			["registerchat", "teyitchat", "teyitkanal"].some(
				(x) => x === choose,
			)
		) {
			setup("RegisterChat", "Register kanalı", "channel");
		}

		if (["registerparent"].some((x) => x === choose)) {
			setup("RegisterParent", "Register kategori", "category");
		}

		if (["publicparent"].some((x) => x === choose)) {
			setup("PublicParent", "Public kategori", "category");
		}

		if (["secretparent"].some((x) => x === choose)) {
			setup("SecretParent", "Secret kategori", "category");
		}

		if (["solvingchat"].some((x) => x === choose)) {
			setup("SolvingChat", "Sorun çözme kanalı", "channel");
		}

		if (["solvingparent"].some((x) => x === choose)) {
			setup("SolvingParent", "Sorun çözme kategori", "category");
		}

		if (["meetingchannel", "toplantıkanal"].some((x) => x === choose)) {
			setup("MeetingChannel", "Toplantı kanalı", "vchannel");
		}

		if (["streamparent"].some((x) => x === choose)) {
			setup("StreamParent", "Stream kategori", "category");
		}

		if (
			["afk", "afkkanal", "afkchannel", "afkroom"].some(
				(x) => x === choose,
			)
		) {
			setup("AFKRoom", "AFK kanalı", "vchannel");
		}

		if (["leaderboardchannel"].some((x) => x === choose)) {
			setup("LeaderboardChannel", "Leaderboard kanalı", "channel");
		}
		if (["rewardchannel"].some((x) => x === choose)) {
			setup("RewardChannel", "Reward kanalı", "channel");
		}

		if (["invitelog"].some((x) => x === choose)) {
			setup("InviteLog", "Invite log kanalı", "channel");
		}
		if (["ruleschannel"].some((x) => x === choose)) {
			setup("RulesChannel", "Rules kanalı", "channel");
		}

		//#endregion Channel

		//#region Log

		if (["banlog"].some((x) => x === choose)) {
			setup("BanLog", "Ban log", "channel");
		}

		if (["jaillog"].some((x) => x === choose)) {
			setup("JailLog", "Jail log", "channel");
		}

		if (["penaltypointlog", "cezapuan"].some((x) => x === choose)) {
			setup("PenaltyPointLog", "Ceza puan log", "channel");
		}

		if (["chatmutelog"].some((x) => x === choose)) {
			setup("ChatMuteLog", "Chat mute log", "channel");
		}

		if (["voicemutelog"].some((x) => x === choose)) {
			setup("VoiceMuteLog", "Voice mute log", "channel");
		}

		async function setup(modal, desc, type) {
			const userrow = new Discord.ActionRowBuilder().addComponents(
				new Discord.UserSelectMenuBuilder()
					.setCustomId("user_select")
					.setMinValues(1)
					.setMaxValues(20),
			);
			const channelrow = new Discord.ActionRowBuilder().addComponents(
				new Discord.ChannelSelectMenuBuilder()
					.setCustomId("channel_select")
					.addChannelTypes(
						Discord.ChannelType.GuildText,
						Discord.ChannelType.AnnouncementThread,
						Discord.ChannelType.GuildForum,
						Discord.ChannelType.GuildAnnouncement,
					)
					.setMinValues(1)
					.setMaxValues(1),
			);
			const vchannelrow = new Discord.ActionRowBuilder().addComponents(
				new Discord.ChannelSelectMenuBuilder()
					.setCustomId("vchannel_select")
					.addChannelTypes(Discord.ChannelType.GuildVoice)
					.setMinValues(1)
					.setMaxValues(20),
			);
			const categoryrow = new Discord.ActionRowBuilder().addComponents(
				new Discord.ChannelSelectMenuBuilder()
					.setCustomId("category_select")
					.addChannelTypes(Discord.ChannelType.GuildCategory)
					.setMinValues(1)
					.setMaxValues(1),
			);

			const rolerow = new Discord.ActionRowBuilder().addComponents(
				new Discord.RoleSelectMenuBuilder()
					.setCustomId("role_select")
					.setMinValues(1)
					.setMaxValues(20),
			);

			if (type == "user") {
				let canzade = await serverData.findOne({
					guildID: message.guild.id,
				});
				let msg = await message.channel.send({
					content: `**${desc}** ayarlamak için aşağıdaki menüyü kullanın.`,
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
						canzade[modal] = interaction.values.map((id) => id);
						await canzade.save();

						client.send(
							`Sunucu **${desc}** başarıyla ${interaction.values
								.map((id) =>
									message.guild.members.cache.get(id),
								)
								.join(", ")} olarak ayarlandı`,
							message.author,
							message.channel,
						);
					}
				});

				collector.on("end", async () => {
					userrow.components[0].setDisabled(true);
					msg.edit({ components: [userrow] });
				});
			}
			if (type == "channel") {
				let canzade = await serverData.findOne({
					guildID: message.guild.id,
				});
				let msg = await message.channel.send({
					content: `**${desc}** ayarlamak için aşağıdaki menüyü kullanın.`,
					components: [channelrow],
				});
				var filter = (interaction) => interaction.user.id;
				const collector = msg.createMessageComponentCollector({
					filter,
					time: 30000,
				});

				collector.on("collect", async (interaction) => {
					channelrow.components[0].setDisabled(true);
					msg.edit({ components: [channelrow] });
					if (interaction.customId === "channel_select") {
						interaction.deferUpdate();
						canzade[modal] = interaction.values[0];
						await canzade.save();

						client.send(
							`Sunucu **${desc}** başarıyla ${message.guild.channels.cache.get(
								interaction.values[0],
							)} olarak ayarlandı`,
							message.author,
							message.channel,
						);
					}
				});

				collector.on("end", async () => {
					channelrow.components[0].setDisabled(true);
					msg.edit({ components: [channelrow] });
				});
			}
			if (type == "vchannel") {
				let canzade = await serverData.findOne({
					guildID: message.guild.id,
				});
				let msg = await message.channel.send({
					content: `**${desc}** ayarlamak için aşağıdaki menüyü kullanın.`,
					components: [vchannelrow],
				});
				var filter = (interaction) => interaction.user.id;
				const collector = msg.createMessageComponentCollector({
					filter,
					time: 30000,
				});

				collector.on("collect", async (interaction) => {
					vchannelrow.components[0].setDisabled(true);
					msg.edit({ components: [vchannelrow] });
					if (interaction.customId === "vchannel_select") {
						interaction.deferUpdate();

						canzade[modal] = interaction.values[0];
						await canzade.save();

						client.send(
							`Sunucu **${desc}** başarıyla ${message.guild.channels.cache.get(
								interaction.values[0],
							)} olarak ayarlandı`,
							message.author,
							message.channel,
						);
					}
				});

				collector.on("end", async () => {
					vchannelrow.components[0].setDisabled(true);
					msg.edit({ components: [vchannelrow] });
				});
			}
			if (type == "category") {
				let canzade = await serverData.findOne({
					guildID: message.guild.id,
				});
				let msg = await message.channel.send({
					content: `**${desc}** ayarlamak için aşağıdaki menüyü kullanın.`,
					components: [categoryrow],
				});
				var filter = (interaction) => interaction.user.id;
				const collector = msg.createMessageComponentCollector({
					filter,
					time: 30000,
				});

				collector.on("collect", async (interaction) => {
					categoryrow.components[0].setDisabled(true);
					msg.edit({ components: [categoryrow] });
					if (interaction.customId === "category_select") {
						interaction.deferUpdate();
						canzade[modal] = interaction.values[0];
						await canzade.save();

						client.send(
							`Sunucu **${desc}** başarıyla ${message.guild.channels.cache.get(
								interaction.values[0],
							)} olarak ayarlandı`,
							message.author,
							message.channel,
						);
					}
				});

				collector.on("end", async () => {
					categoryrow.components[0].setDisabled(true);
					msg.edit({ components: [categoryrow] });
				});
			} else if (type == "role") {
				let canzade = await serverData.findOne({
					guildID: message.guild.id,
				});
				let msg = await message.channel.send({
					content: `**${desc}** ayarlamak için aşağıdaki menüyü kullanın.`,
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
						canzade[modal] = interaction.values.map((id) => id);
						await canzade.save(),
							client.send(
								`Sunucu **${desc}** başarıyla ${interaction.values
									.map((id) =>
										interaction.guild.roles.cache
											.get(id)
											.toString(),
									)
									.join(", ")} olarak ayarlandı`,
								message.author,
								message.channel,
							);
					}
				});
				collector.on("end", async () => {
					rolerow.components[0].setDisabled(true);
					msg.edit({ components: [rolerow] });
				});
			}
		}
	},
};
