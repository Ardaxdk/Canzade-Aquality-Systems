const moment = require("moment");
const kayıtlar = require("../../models/kayıtlar.js");
const data = require("../../models/cezalar.js");
let serverSettings = require("../../models/serverSettings");
const isimler = require("../../models/isimler.js");
const Discord = require("discord.js");
module.exports = {
	conf: {
		name: "isim",
		usage: "isim [@user] [isim] [yaş]",
		category: "Register",
		description: "Belirttiğiniz kişinin ismini değiştirirsiniz.",
		aliases: ["nick", "erkek", "kadın", "e", "k"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});

		if (
			!message.member.roles.cache.some((r) =>
				server.RegisterAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;

		if (!server.RegisterSystem)
			return message.channel.send({
				content: `
🔒 Kayıtlar bir yönetici tarafından __geçici bir süreliğine kapatılmıştır.__ Lütfen bu süreçte beklemede kalın. Anlayışla karşıladığınız için teşekkürler!`,
			});

		const member =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!member)
			return client.send(
				"Bir üye etiketle ve tekrardan dene!",
				message.author,
				message.channel,
			);
		const nick = args
			.slice(1)
			.filter((arg) => isNaN(arg))
			.map((arg) => arg[0].toUpperCase() + arg.slice(1).toLowerCase())
			.join(" ");
		if (!nick)
			return client.send(
				"Yeni ismi belirtin.",
				message.author,
				message.channel,
			);
		if (nick && (await client.chatKoruma(nick)))
			return client.send(
				"Üyenin kullanıcı ismine reklam veya küfür yazamazsınız lütfen geçerli bir isim girip yeniden deneyiniz.",
				message.author,
				message.channel,
			);
		const age = args.slice(1).filter((arg) => !isNaN(arg))[0] ?? undefined;
		if (!age || isNaN(age))
			return client.send(
				"Geçerli bir yaş belirtin.",
				message.author,
				message.channel,
			);
		if (
			message.guild.members.cache.has(member.id) &&
			message.member.roles.highest.position <=
				message.guild.members.cache.get(member.id).roles.highest
					.position
		)
			return client.send(
				"Kendi rolünden yüksek kişilere işlem uygulayamazsın!",
				message.author,
				message.channel,
			);
		if (nick.length > 30)
			return client.send(
				message,
				"isim ya da yaş ile birlikte toplam 30 karakteri geçecek bir isim giremezsin.",
			);
		if (age < 15)
			return client.send(
				`Kayıt ettiğin üyenin yaşı 15'(t(d)(a(e)n küçük olamaz.`,
				message.author,
				message.channel,
			);
		if (age > 99)
			return client.send(
				`Kayıt ettiğin üyenin yaşı iki basamakdan büyük olamaz.`,
				message.author,
				message.channel,
			);
		if (!member.manageable)
			return client.send(
				`Kullanıcı benden yüksek bir pozisyona sahip o yüzden ismini değiştiremiyorum.`,
				message.author,
				message.channel,
			);

		await data
			.find({ user: member.id })
			.sort({ ihlal: "descending" })
			.exec(async (err, res) => {
				if (!res)
					return client.send(
						`${member} kullanıcısının ceza bilgisi bulunmuyor.`,
						message.author,
						message.channel,
					);

				let puan = await client.punishPoint(member.id);
				let cezasayı = await client.cezasayı(member.id);

				if (
					cezasayı >= 7 &&
					!message.member.roles.cache.some(
						(role) =>
							message.guild.roles.cache.get(
								`${server.FamilyRole}`,
							).rawPosition <= role.rawPosition,
					)
				) {
					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.avatarURL({
								dynamic: true,
							}),
						})
						.setColor("Random").setDescription(`
🚫 ${member.toString()} kişisine toplam ${cezasayı} kez ceza-i işlem uygulandığı için kayıt işlemi iptal edildi.Sunucumuzda tüm işlemlerin kayıt altına alındığını unutmayın.Sorun teşkil eden, sunucunun huzurunu bozan ve kurallara uymayan kullanıcılar sunucumuza kayıt olamazlar.

Eğer konu hakkında bir şikayetiniz var ise <@&${
						server.SeniorOfficial
					}> rolü ve üstlerine ulaşabilirsiniz.
`);
					return message.reply({ embeds: [embed] });
				}

				const newnick = `${
					member.user.username.includes(server.Tag)
						? server.Tag
						: server.SecondaryTag
						? server.SecondaryTag
						: server.SecondaryTag || ""
				} ${nick} | ${age}`;
				await member.setNickname(newnick);

				let registerModel = await isimler.findOne({
					user: member.user.id,
					isimler: [],
				});
				if (!registerModel)
					registerModel = await isimler.findOne({
						user: member.user.id,
						isimler: [],
					});

				isimler.findOne({ user: member.id }, async (err, res) => {
					const memeaç = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.avatarURL({
								dynamic: true,
							}),
						})
						.setDescription(
							`${
								!res
									? `${member} kişisinin ismi ${nick} | ${age} olarak değiştirildi`
									: `
${member} kişisinin ismi "${nick} | ${age}" olarak değiştirildi, bu üye daha önce bu isimlerle kayıt olmuş.
  
${client.emojis.cache.find(
	(x) => x.name === client.settings.emojis.no_name,
)} Kişinin toplamda **${res.isimler.length}** isim kayıtı bulundu.
${res.isimler
	.map((x) => `\`• ${x.isim}\` (${x.state})`)
	.slice(0, 10)
	.join("\n")}

Kişinin önceki isimlerine \`a!isimler @üye\` komutuyla bakarak kayıt işlemini gerçekleştirmeniz önerilir.`
							}`,
						)
						.setColor("Random"); //  - (${x.yetkili.replace(message.author.id, `<@${x.yetkili}>`).replace(`Yok`,`Yok`)})

					if (message.channel.id === server.RegisterChat) {
						if (!client.kayıtlar.has(message.author.id)) {
							client.kayıtlar.set(message.author.id, member.id);
						}
					}

					const row = new Discord.ActionRowBuilder().addComponents(
						new Discord.ButtonBuilder()
							.setCustomId("Erkek")
							.setLabel("Erkek")
							.setStyle(Discord.ButtonStyle.Success),
						new Discord.ButtonBuilder()
							.setCustomId("Kadın")
							.setLabel("Kadın")
							.setStyle(Discord.ButtonStyle.Secondary),
					);
					let msg = await message.channel.send({
						components: [row],
						embeds: [memeaç],
					});

					var filter = (button) =>
						button.user.id === message.author.id;
					const collector = msg.createMessageComponentCollector({
						filter,
						time: 30000,
					});

					if (
						server.ManRole.some((x) => member.roles.cache.has(x)) ||
						server.WomanRole.some((x) => member.roles.cache.has(x))
					) {
						if (client.kayıtlar.has(message.author.id)) {
							client.kayıtlar.delete(message.author.id);
						}
						return isimler.findOne(
							{ user: member.id },
							async (err, res) => {
								if (!res) {
									let arr = [];
									arr.push({
										isim: newnick,
										state: "İsim Değiştirme",
										yetkili: message.author.id,
									});
									let newData = new isimler({
										user: member.id,
										isimler: arr,
									});
									await newData
										.save()
										.catch((e) => console.log(e));
								} else {
									res.isimler.push({
										isim: newnick,
										state: "İsim Değiştirme",
										yetkili: message.author.id,
									});
									await res
										.save()
										.catch((e) => console.log(e));
								}

								row.components[0]
									.setStyle(Discord.ButtonStyle.Danger)
									.setDisabled(true);
								row.components[1]
									.setStyle(Discord.ButtonStyle.Danger)
									.setDisabled(true);

								const embed = new Discord.EmbedBuilder()
									.setAuthor({
										name: message.author.username,
										iconURL: message.author.avatarURL({
											dynamic: true,
										}),
									})
									.setDescription(
										`${
											!res
												? `${member} kişisinin ismi ${nick} | ${age} olarak değiştirildi`
												: `
${member} kişisinin ismi "${nick} | ${age}" olarak değiştirildi, bu üye daha önce bu isimlerle kayıt olmuş.
	
${client.emojis.cache.find(
	(x) => x.name === client.settings.emojis.no_name,
)} Kişinin toplamda **${res.isimler.length}** isim kayıtı bulundu.
${res.isimler
	.map((x) => `\`• ${x.isim}\` (${x.state})`)
	.slice(0, 10)
	.join("\n")}
  
Kişinin önceki isimlerine \`a!isimler @üye\` komutuyla bakarak kayıt işlemini gerçekleştirmeniz önerilir.

Kullanıcı zaten kayıtlı olduğundan işlem iptal edildi.
`
										}`,
									)

									.setColor("Random");

								msg.edit({
									embeds: [embed],
									components: [row],
								});
							},
						);
					}

					collector.on("end", async (button, reason) => {});
					collector.on("collect", async (button, user) => {
						button.deferUpdate();
						row.components[0].setDisabled(true);
						row.components[1].setDisabled(true);

						if (button.customId === "Erkek") {
							if (server && server.TaggedMode === true) {
								if (
									!member.user.username.includes(
										server.Tag,
									) &&
									!member.premiumSince &&
									!member.roles.cache.has(server.VipRole)
								)
									return client.send(
										"Şuanlık bu sunucuda sunucuda taglı alım mevcuttur ( " +
											server.Tag +
											" ) tagını alarak kayıt olabilirsin, bir süre sonra tagsız alıma geçildiğinde gelmeyi de tercih edebilirsin.",
										message.author,
										message.channel,
									);
							}
							await kayıtlar.findOne(
								{ user: message.author.id },
								async (err, res) => {
									if (res) {
										if (res.kayıtlar.includes(member.id)) {
											res.erkek = res.erkek;
											await res
												.save()
												.catch((e) => console.log(e));
										} else {
											res.kayıtlar.push(member.id);
											res.erkek = res.erkek + 1;
											res.toplam = res.toplam + 1;
											await res
												.save()
												.catch((e) => console.log(e));
										}
									} else if (!res) {
										let arr = [];
										arr.push(member.id);
										const data = new kayıtlar({
											user: message.author.id,
											erkek: 1,
											kadın: 0,
											toplam: 1,
											kayıtlar: arr,
										});
										await data
											.save()
											.catch((e) => console.log(e));
									}
								},
							);

							if (
								server.ManRole.some(
									(x) => !member.roles.cache.has(x),
								)
							) {
								setTimeout(() => {
									member.roles.add(server.ManRole);
								}, 2000);
								member.roles.remove(server.UnregisteredRole);

								isimler.findOne(
									{ user: member.id },
									async (err, res) => {
										const memeaç =
											new Discord.EmbedBuilder()
												.setAuthor({
													name: message.author
														.username,
													iconURL:
														message.author.avatarURL(
															{ dynamic: true },
														),
												})
												.setDescription(
													`${
														!res
															? `${member} kişisinin ismi ${nick} | ${age} olarak değiştirildi

**Erkek** olarak kaydedildi.`
															: `
${member} kişisinin ismi "${nick} | ${age}" olarak değiştirildi, bu üye daha önce bu isimlerle kayıt olmuş.
			
${client.emojis.cache.find(
	(x) => x.name === client.settings.emojis.no_name,
)} Kişinin toplamda **${res.isimler.length}** isim kayıtı bulundu.
${res.isimler
	.map((x) => `\`• ${x.isim}\` (${x.state})`)
	.slice(0, 10)
	.join("\n")}

Kişinin önceki isimlerine \`a!isimler @üye\` komutuyla bakarak kayıt işlemini gerçekleştirmeniz önerilir.

**Erkek** olarak kaydedildi.`
													}`,
												)
												.setColor("Random"); //  - (${x.yetkili.replace(message.author.id, `<@${x.yetkili}>`).replace(`Yok`,`Yok`)})

										msg.edit({
											embeds: [memeaç],
											components: [row],
										});

										client.channels.cache
											.get(server.GeneralChat)
											.send({
												content: `Aramıza yeni biri katıldı! ${member} ona hoş geldin diyelim!${client.emojis.cache.find(
													(x) =>
														x.name ===
														client.settings.emojis
															.ayicik_name,
												)}`,
											});

										isimler.findOne(
											{ user: member.id },
											async (err, res) => {
												if (!res) {
													let arr = [];
													arr.push({
														isim: member.displayName,
														state:
															"" +
															server.ManRole.map(
																(x) =>
																	`<@&${x}>`,
															) +
															"",
														yetkili:
															message.author.id,
													});
													let newData = new isimler({
														user: member.id,
														isimler: arr,
													});
													await newData
														.save()
														.catch((e) =>
															console.log(e),
														);
												} else {
													res.isimler.push({
														isim: member.displayName,
														state:
															"" +
															server.ManRole.map(
																(x) =>
																	`<@&${x}>`,
															) +
															"",
														yetkili:
															message.author.id,
													});
													await res
														.save()
														.catch((e) =>
															console.log(e),
														);
												}
											},
										);
									},
								);
							}
						} else if (button.customId === "CANCEL") {
							row.components[0].setDisabled(true);
							row.components[1].setDisabled(true);
							msg.edit({ components: [row] });

							const embed = new Discord.EmbedBuilder()
								.setAuthor({
									name: message.author.username,
									iconURL: message.author.avatarURL({
										dynamic: true,
									}),
								})
								.setColor("Random")
								.setDescription(
									`${member.toString()} adlı kullanıcının kayıt işlemi iptal edildi.`,
								);
							button.reply({ embeds: [embed] });

							isimler.findOne(
								{ user: member.id },
								async (err, res) => {
									if (!res) {
										let arr = [];
										arr.push({
											isim: newnick,
											state: "İsim Değiştirme",
											yetkili: message.author.id,
										});
										let newData = new isimler({
											user: member.id,
											isimler: arr,
										});
										await newData
											.save()
											.catch((e) => console.log(e));
									} else {
										res.isimler.push({
											isim: newnick,
											state: "İsim Değiştirme",
											yetkili: message.author.id,
										});
										await res
											.save()
											.catch((e) => console.log(e));
									}
								},
							);
						} else if (button.customId === "Kadın") {
							if (server && server.TaggedMode === true) {
								if (
									!member.user.username.includes(
										server.Tag,
									) &&
									!member.premiumSince &&
									!member.roles.cache.has(server.VipRole)
								)
									return client.send(
										"Şuanlık bu sunucuda sunucuda taglı alım mevcuttur ( " +
											server.Tag +
											" ) tagını alarak kayıt olabilirsin, bir süre sonra tagsız alıma geçildiğinde gelmeyi de tercih edebilirsin.",
										message.author,
										message.channel,
									);
							}
							await kayıtlar.findOne(
								{ user: message.author.id },
								async (err, res) => {
									if (res) {
										if (res.kayıtlar.includes(member.id)) {
											res.kadın = res.kadın;
											await res
												.save()
												.catch((e) => console.log(e));
										} else {
											res.kayıtlar.push(member.id);
											res.kadın = res.kadın + 1;
											res.toplam = res.toplam + 1;
											await res
												.save()
												.catch((e) => console.log(e));
										}
									} else if (!res) {
										let arr = [];
										arr.push(member.id);
										const data = new kayıtlar({
											user: message.author.id,
											erkek: 0,
											kadın: 1,
											toplam: 1,
											kayıtlar: arr,
										});
										await data
											.save()
											.catch((e) => console.log(e));
									}
								},
							);
							if (
								server.ManRole.some((x) =>
									member.roles.cache.has(x),
								) ||
								server.WomanRole.some((x) =>
									member.roles.cache.has(x),
								)
							) {
								if (client.kayıtlar.has(message.author.id)) {
									client.kayıtlar.delete(message.author.id);
								}
								return button.reply({
									content:
										"<@" +
										member +
										"> kullanıcısı zaten sunucumuza kayıtlı olduğundan dolayı kayıt işlemi iptal edildi!",
								});
							}

							if (
								server.WomanRole.some(
									(x) => !member.roles.cache.has(x),
								)
							) {
								setTimeout(() => {
									member.roles.add(server.WomanRole);
								}, 2000);
								member.roles.remove(server.UnregisteredRole);
								isimler.findOne(
									{ user: member.id },
									async (err, res) => {
										const embed = new Discord.EmbedBuilder()
											.setAuthor({
												name: message.author.username,
												iconURL:
													message.author.avatarURL({
														dynamic: true,
													}),
											})
											.setDescription(
												`${
													!res
														? `${member} kişisinin ismi ${nick} | ${age} olarak değiştirildi
      
**Kadın** olarak kaydedildi.`
														: `
${member} kişisinin ismi "${nick} | ${age}" olarak değiştirildi, bu üye daha önce bu isimlerle kayıt olmuş.
			
${client.emojis.cache.find(
	(x) => x.name === client.settings.emojis.no_name,
)} Kişinin toplamda **${res.isimler.length}** isim kayıtı bulundu.
${res.isimler
	.map((x) => `\`• ${x.isim}\` (${x.state})`)
	.slice(0, 10)
	.join("\n")}

Kişinin önceki isimlerine \`a!isimler @üye\` komutuyla bakarak kayıt işlemini gerçekleştirmeniz önerilir.

**Kadın** olarak kaydedildi.`
												}`,
											)
											.setColor("Random"); //  - (${x.yetkili.replace(message.author.id, `<@${x.yetkili}>`).replace(`Yok`,`Yok`)})

										msg.edit({
											embeds: [embed],
											components: [row],
										});

										client.channels.cache
											.get(server.GeneralChat)
											.send({
												content: `Aramıza yeni biri katıldı! ${member} ona hoş geldin diyelim!${client.emojis.cache.find(
													(x) =>
														x.name ===
														client.settings.emojis
															.ayicik_name,
												)}`,
											});
										isimler.findOne(
											{ user: member.id },
											async (err, res) => {
												if (!res) {
													let arr = [];
													arr.push({
														isim: member.displayName,
														state:
															"<" +
															server.WomanRole.map(
																(x) =>
																	`<@&${x}>`,
															) +
															"",
														yetkili:
															message.author.id,
													});
													let newData = new isimler({
														user: member.id,
														isimler: arr,
													});
													await newData
														.save()
														.catch((e) =>
															console.log(e),
														);
												} else {
													res.isimler.push({
														isim: member.displayName,
														state:
															"" +
															server.WomanRole.map(
																(x) =>
																	`<@&${x}>`,
															) +
															"",
														yetkili:
															message.author.id,
													});
													await res
														.save()
														.catch((e) =>
															console.log(e),
														);
												}
											},
										);
									},
								);
							}
						}
					});
				});
			});
	},
};
