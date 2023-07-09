const roller = require("../models/rollog.js");
const Discord = require("discord.js");
const isimler = require("../models/isimler.js");
let serverSettings = require("../models/serverSettings");

module.exports = async (oldMember, newMember) => {
	let server = await serverSettings.findOne({});
	if (
		oldMember.roles.cache.has(server.BoosterRole) &&
		!newMember.roles.cache.has(server.BoosterRole)
	)
		try {
			isimler.findOne({ user: newMember.id }, async (err, res) => {
				if (!res) return;
				if (!res.isimler) return;
				res = res.isimler.reverse();
				var History = res.splice(0, 1).map((e) => e.isim.replace());
				if (
					oldMember.roles.cache.has(server.BoosterRole) &&
					!newMember.roles.cache.has(server.BoosterRole)
				) {
					let setName = `${History}`;
					if (newMember.manageable) {
						await newMember.setNickname(
							`${setName}`,
							"Boostunu çektiği/bittiği için kullanıcı adı eski haline çevirildi.",
						);
					}
				}
			});
		} catch (error) {
			client.logger.error(
				`Etkinlik: ${module.exports.name} \nHata: ` + error + ``,
			);
		}
	const kanal = client.channels.cache.find(
		(channel) => channel.name === "rol-yönet",
	);

	await newMember.guild
		.fetchAuditLogs({
			type: Discord.AuditLogEvent.MemberRoleUpdate,
		})
		.then(async (audit) => {
			let ayar = audit.entries.first();
			let hedef = ayar.target;
			let yapan = ayar.executor;
			if (yapan.bot) return;
			newMember.roles.cache.forEach(async (role) => {
				if (!oldMember.roles.cache.has(role.id)) {
					const emed = new Discord.EmbedBuilder()
						.setAuthor({
							name: hedef.username,
							iconURL: hedef.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setColor("Random")
						.setDescription(
							`
                        **Rol Eklenen kişi**\n ${hedef} - **${hedef.id}** `,
						)
						.addFields([
							{
								name: `${client.emojis.cache.find(
									(x) =>
										x.name ===
										client.settings.emojis.yes_name,
								)} Rolü Ekleyen Kişi`,
								value: `${yapan} - **${yapan.id}**`,
							},
						])
						.addFields([
							{
								name: `${client.emojis.cache.find(
									(x) =>
										x.name ===
										client.settings.emojis.yes_name,
								)} Eklenen Rol`,
								value: `${role} - **${role.id}**`,
							},
						])
						.setFooter({
							text: yapan.username,
							iconURL: yapan.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setTimestamp();
					kanal.send({ embeds: [emed] });
					roller.findOne(
						{
							user: hedef.id,
						},
						async (err, res) => {
							if (!res) {
								let arr = [];
								arr.push({
									rol: role.id,
									mod: yapan.id,
									tarih: Date.parse(new Date()),
									state: "Ekleme",
								});
								let newData = new roller({
									user: hedef.id,
									roller: arr,
								});
								await newData
									.save()
									.catch((e) => console.log(e));
							} else {
								res.roller.push({
									rol: role.id,
									mod: yapan.id,
									tarih: Date.parse(new Date()),
									state: "Ekleme",
								});
								await res.save().catch((e) => console.log(e));
							}
						},
					);
				}
			});
			oldMember.roles.cache.forEach(async (role) => {
				if (!newMember.roles.cache.has(role.id)) {
					const emeed = new Discord.EmbedBuilder()
						.setAuthor({
							name: hedef.username,
							iconURL: hedef.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setColor("Random")
						.setDescription(
							`
                        **Rolü Alınan kişi** \n${hedef} - **${hedef.id}**`,
						)
						.addFields([
							{
								name: `${client.emojis.cache.find(
									(x) =>
										x.name ===
										client.settings.emojis.no_name,
								)} Rolü Alan Kişi`,
								value: `${yapan} - **${yapan.id}**`,
							},
						])
						.addFields([
							{
								name: `${client.emojis.cache.find(
									(x) =>
										x.name ===
										client.settings.emojis.no_name,
								)} Alınan Rol`,
								value: `${role} - **${role.id}**`,
							},
						])
						.setFooter({
							text: yapan.username,
							iconURL: yapan.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setTimestamp();
					kanal.send({ embeds: [emeed] });
					roller.findOne(
						{
							user: hedef.id,
						},
						async (err, res) => {
							if (!res) {
								let arr = [];
								arr.push({
									rol: role.id,
									mod: yapan.id,
									tarih: Date.parse(new Date()),
									state: "Kaldırma",
								});
								let newData = new roller({
									user: hedef.id,
									roller: arr,
								});
								await newData
									.save()
									.catch((e) => console.log(e));
							} else {
								res.roller.push({
									rol: role.id,
									mod: yapan.id,
									tarih: Date.parse(new Date()),
									state: "Kaldırma",
								});
								await res.save().catch((e) => console.log(e));
							}
						},
					);
				}
			});
		});
};

module.exports.conf = {
	name: "guildMemberUpdate",
};
