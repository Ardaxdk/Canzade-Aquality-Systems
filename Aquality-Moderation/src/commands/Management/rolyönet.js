const Discord = require("discord.js");
const roller = require("../../models/rollog.js");
const moment = require("moment");
let serverSettings = require("../../models/serverSettings");
require("moment-duration-format");
moment.locale("tr");

module.exports = {
	conf: {
		name: "r",
		usage: "r ver [@user] [@rol]",
		category: "Management",
		description: "Belirttiğiniz üyeye rol verip/alırsınız.",
		aliases: ["r"],
	},
	// d!r args[0](al-ver) args[1](Kullanıcı) args[2](Rol)
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (
			!message.member.roles.cache.some((r) =>
				server.RoleManageAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		if (!args[0])
			return client.send(
				"Kullanımı: !r al/ver @Zade RolID",
				message.author,
				message.channel,
			);
		if (args[0] != "al") {
			if (args[0] != "ver") {
				return client.send(
					"Kullanımı: !r al/ver @Zade RolID",
					message.author,
					message.channel,
				);
			}
		}
		if (!args[1])
			return client.send(
				"Kullanıcıyı belirtmelisin.",
				message.author,
				message.channel,
			);
		let user =
			message.mentions.members.first() ||
			(await client.üye(args[1], message.guild));
		if (!user)
			return client.send(
				"Kullanıcıyı düzgünce belirt ve tekrar dene !",
				message.author,
				message.channel,
			);
		if (!args[2])
			return client.send(
				"Rolü belirtmelisin.",
				message.author,
				message.channel,
			);
		let role =
			message.mentions.roles.first() ||
			message.guild.roles.cache.get(args[2]);
		if (!role)
			return client.send(
				"Belirtmiş olduğun rolü bulamadım ! Düzgün bir rol etiketle veya ID belirtip tekrar dene.",
				message.author,
				message.channel,
			);
		if (message.member.roles.highest.rawPosition <= role.rawPosition)
			return client.send(
				"Kendi rolünden yüksek veya eşit bir rolle işlem yapamazsın.",
				message.author,
				message.channel,
			);
		if (!role.editable) return;
		// if (client.settings.roles.authyRoles.highest.position >= role.position.includes(role.id)) return client.send("Yetki rolleri ile işlem yapamazsın.", message.author, message.channel)
		let banNum = client.roleLimit.get(message.author.id) || 0;
		client.roleLimit.set(message.author.id, banNum + 1);
		if (banNum == 5)
			return client.send(
				"Gün içerisinde çok fazla rol işlemi uyguladığınız için komut geçici olarak kullanımınıza kapatılmıştır.",
				message.author,
				message.channel,
			);
		if (args[0] == "al") {
			const embed2 = new Discord.EmbedBuilder();
			embed2.setAuthor({
				name: message.guild.name,
				iconURL: client.user.displayAvatarURL({ dynamic: true }),
			});

			embed2.setColor("Random");
			if (user.roles.cache.has(role.id)) {
				user.roles.remove(role.id);
				embed2.setDescription(
					`${user} Kişisinden ${role} rolünü aldım.`,
				);
				const embed = new Discord.EmbedBuilder()
					.setAuthor({
						name: message.guild.name,
						iconURL: client.user.displayAvatarURL({
							dynamic: true,
						}),
					})
					.setColor("Random")
					.setDescription(
						`${client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.no_name,
						)} ${user} - (\`${user.id}\`) kişisinden rol alındı!`,
					)
					.addFields([
						{
							name: "Alan Kişi",
							value: `<@${message.author.id}> - (\`${message.author.id}\`)`,
						},
					])
					.addFields([{ name: "Alınan Rol", value: `${role}` }])
					.setFooter({
						text: message.author.username,
						iconURL: message.author.displayAvatarURL({
							dynamic: true,
						}),
					})
					.setTimestamp();
				client.channels.cache
					.find((channel) => channel.name === "rol-yönet")
					.send({ embeds: [embed] });
				roller.findOne(
					{
						user: user.id,
					},
					async (err, res) => {
						if (!res) {
							let arr = [];
							arr.push({
								rol: role.id,
								mod: message.author.id,
								tarih: Date.parse(new Date()),
								state: "Kaldırma",
							});
							let newData = new roller({
								user: user.id,
								roller: arr,
							});
							await newData.save().catch((e) => console.log(e));
						} else {
							res.roller.push({
								rol: role.id,
								mod: message.author.id,
								tarih: Date.parse(new Date()),
								state: "Kaldırma",
							});
							await res.save().catch((e) => console.log(e));
						}
					},
				);
			} else {
				embed2.setDescription(
					`${user} Kişisinde ${role} rolü mevcut değil.`,
				);
			}
			message.channel.send({ embeds: [embed2] });
		}
		if (args[0] == "ver") {
			const embed2 = new Discord.EmbedBuilder();
			embed2.setAuthor({
				name: message.guild.name,
				iconURL: client.user.displayAvatarURL({ dynamic: true }),
			});
			embed2.setColor("Random");
			if (!user.roles.cache.has(role.id)) {
				user.roles.add(role.id);
				embed2.setDescription(
					`${user} Kişisine ${role} rolünü ekledim.`,
				);

				roller.findOne(
					{
						user: user.id,
					},
					async (err, res) => {
						if (!res) {
							let arr = [];
							arr.push({
								rol: role.id,
								mod: message.author.id,
								tarih: Date.parse(new Date()),
								state: "Ekleme",
							});
							let newData = new roller({
								user: user.id,
								roller: arr,
							});
							await newData.save().catch((e) => console.log(e));
						} else {
							res.roller.push({
								rol: role.id,
								mod: message.author.id,
								tarih: Date.parse(new Date()),
								state: "Ekleme",
							});
							await res.save().catch((e) => console.log(e));
						}
					},
				);
			} else {
				embed2.setDescription(
					`${user} Kişisinde ${role} rolü zaten mevcut.`,
				);
			}
			message.channel.send({ embeds: [embed2] });
		}
	},
};
