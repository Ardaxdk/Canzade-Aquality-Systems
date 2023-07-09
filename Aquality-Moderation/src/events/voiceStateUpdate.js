let database = require("../models/voicemute.js");
const mutes = require("../models/waitMute.js");
const mutedUser = require("../models/voicemute.js");
const Discord = require("discord.js");
let serverSettings = require("../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");
const ms = require("ms");

module.exports = async (oldState, newState) => {
	let server = await serverSettings.findOne({});
	if (
		!oldState.member ||
		!newState.member ||
		oldState.member.guild.id != client.settings.GUILD_ID ||
		oldState.member.user.bot ||
		newState.member.user.bot
	)
		return;

	/* Kanala katılırsa */
	if (!oldState.channelId && newState.channelId) {
		//if (!newState.selfDeaf /*&& !newState.selfMute*/) {
		if (!client.channelTime.has(newState.member.id)) {
			client.channelTime.set(newState.member.id, {
				channel: newState.id,
				time: Date.now(),
			});
		}

		if (
			newState.serverMute &&
			newState.member.voice.channel.parentId === server.SolvingParent
		) {
			if (newState.member && newState.member.voice.channel)
				newState.member.voice.setMute(
					false,
					"Sorun çözme kanallarına giriş yaptığı için ses mutesi kaldırıldı.",
				);

			client.channels.cache.get(server.PenaltyPointLog).send({
				content: `
${newState.member} Chat veya Ses mutesine sahipken;
        
\` - \` Sorun çözme kanallarında geçirdiğiniz süre, **ceza sürenizden eksilmeyecektir.**
        
\` - \` Eğer ses mute cezanız varken, konuşabilir durumdaysanız bir süre sonra ses mute süreniz kadar **timeout yiyeceksiniz!**
                    `,
			});
		} else
			await mutes.findOne(
				{ user: newState.member.id },
				async (err, res) => {
					if (!res) return;
					await database.findOne(
						{ user: newState.member.id },
						async (err, doc) => {
							if (!doc) {
								const newData = new database({
									user: newState.member.id,
									muted: true,
									yetkili: res.yetkili,
									endDate: Date.now() + res.date,
									start: Date.now(),
									sebep: res.sebep,
								});
								await newData
									.save()
									.catch((e) => console.log(e));
							}
						},
					);
					newState.member.voice.setMute(true, res.sebep);
					let userx = client.users.cache.get(res.yetkili);
					let sonraki = Date.parse(new Date()) + res.date;
					const mutelendi = new Discord.EmbedBuilder()
						.setAuthor({
							name: userx.username,
							iconURL: userx.displayAvatarURL({ dynamic: true }),
						})
						.setColor("Random")
						.setFooter({ text: `Ceza Numarası: #${res.cezano}` })
						.setDescription(`
${newState.member} (\`${newState.member.user.username}\` - \`${
						newState.member.id
					}\`) kişisinin ${await client.turkishDate(
						res.date,
					)} süresi boyunca ses mute cezası ses kanalına bağlandığı için otomatik olarak başlatıldı.
        
• Susturulma sebebi: \`${res.sebep}\`
• Ses Mute atılma tarihi: \`${moment(Date.parse(new Date())).format("LLL")}\`
• Ses Mute bitiş tarihi: \`${moment(sonraki).format("LLL")}\``);
					await client.channels.cache
						.get(server.VoiceMuteLog)
						.send({ embeds: [mutelendi] });
					await mutes.deleteOne(
						{ user: newState.member.id },
						async (err) => {
							if (err) {
								console.log("Silinemedi.");
							}
						},
					);
				},
			);
	}

	/* kanaldan ayrılırsa */
	if (oldState.channelId && !newState.channelId) {
		if (client.channelTime.has(oldState.member.id)) {
			client.channelTime.delete(oldState.member.id);
		}
	}

	/* kanal değişirse */
	if (oldState.channel && newState.channelId) {
		if (client.channelTime.has(newState.member.id)) {
			client.channelTime.set(newState.member.id, {
				channel: newState.id,
				time: Date.now(),
			});
		}

		if (
			newState.serverMute &&
			newState.member.voice.channel.parentId === server.SolvingParent
		) {
			if (newState.member && newState.member.voice.channel)
				newState.member.voice.setMute(
					false,
					"Sorun çözme kanallarına giriş yaptığı için ses mutesi kaldırıldı.",
				);

			client.channels.cache.get(server.PenaltyPointLog).send({
				content: `
${newState.member} Chat veya Ses mutesine sahipken;
    
\` - \` Sorun çözme kanallarında geçirdiğiniz süre, **ceza sürenizden eksilmeyecektir.**
    
\` - \` Eğer ses mute cezanız varken, konuşabilir durumdaysanız bir süre sonra ses mute süreniz kadar **timeout yiyeceksiniz!**
                `,
			});
		} else
			await mutes.findOne(
				{ user: newState.member.id },
				async (err, res) => {
					if (!res) return;
					await database.findOne(
						{ user: newState.member.id },
						async (err, doc) => {
							if (!doc) {
								const newData = new database({
									user: newState.member.id,
									muted: true,
									yetkili: res.yetkili,
									endDate: Date.now() + res.date,
									start: Date.now(),
									sebep: res.sebep,
								});
								await newData
									.save()
									.catch((e) => console.log(e));
							}
						},
					);
					newState.member.voice.setMute(true, res.sebep);
					let userx = client.users.cache.get(res.yetkili);
					let sonraki = Date.parse(new Date()) + res.date;
					const mutelendi = new Discord.EmbedBuilder()
						.setAuthor({
							name: userx.username,
							iconURL: userx.displayAvatarURL({ dynamic: true }),
						})
						.setColor("Random")
						.setFooter({ text: `Ceza Numarası: #${res.cezano}` })
						.setDescription(`
${newState.member} (\`${newState.member.user.username}\` - \`${
						newState.member.id
					}\`) kişisinin ${await client.turkishDate(
						res.date,
					)} süresi boyunca ses mute cezası otomatik olarak başlatıldı.
    
• Susturulma sebebi: \`${res.sebep}\`
• Ses Mute atılma tarihi: \`${moment(Date.parse(new Date())).format("LLL")}\`
• Ses Mute bitiş tarihi: \`${moment(sonraki).format("LLL")}\``);
					await client.channels.cache
						.get(server.VoiceMuteLog)
						.send({ embeds: [mutelendi] });
				},
			);
	}

	/* Kulaklık - mic açarsa */
	if (oldState.serverMute && !newState.serverMute) {
		/*	if (server.GuildOwner.includes(newState.member.id)) return;
		mutedUser.findOne({ user: newState.member.id }, async (err, doc) => {
			if (!doc) return;
			if (doc.muted == true) {
				const embed = new Discord.EmbedBuilder()
					.setAuthor({
						name: newState.member.user.username,
						iconURL: newState.member.user.displayAvatarURL({
							dynamic: true,
						}),
					})
					.setDescription(
						`
${newState.member} adlı kullanıcının ses susturması bitmeden mutesi sağ tık ile açıldı.

Susturmayı açan yetkili: 
Cezayı uygulayan yetkili <@${doc.yetkili}> - (\`${doc.yetkili}\`)`,
					)
					.setThumbnail(
						newState.member.user.displayAvatarURL({
							dynamic: true,
						}),
					)
					.setFooter({
						text:
							"Bitmesine kalan süre: " +
							moment(doc.endDate).format("h:mm:ss") +
							"",
					});
				client.channels.cache
					.find((channel) => channel.name === "sağ-tık-ceza-işlem")
					.send({ embeds: [embed] });
				if (newState.member.voice.setMute(true)) {
					newState.member.voice.setMute(true);
					/*yapan
						.send({content:
							`${newState.member} adlı kullanıcının ses susturması bitmeden mutesini sağ tık ile açtığınız için kullanıcıyı yeniden susturdum. Lütfen ceza süreleri bitmeden herhangi bir sağ tık işlemi uygulamayın.`,
						})
						.catch((e) => console.log(e));*/
		/*}
			}
		});*/
	}
};

module.exports.conf = {
	name: "voiceStateUpdate",
};
