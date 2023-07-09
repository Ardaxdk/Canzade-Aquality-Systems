const mongoose = require("mongoose");
const Discord = require("discord.js");
const cezalar = require("../models/cezalar.js");
const data = require("../models/yasaklıtag");
const moment = require("moment");
moment.locale("tr");
let serverSettings = require("../models/serverSettings");
const mutes = require("../models/chatmute.js");
module.exports = async (client) => {
	async function control() {
		const serverModel = await serverSettings.findOne({});
		if (!serverModel) return console.error("Server model not found");
		const bannedTag = await data.findOne({
			guild: client.settings.GUILD_ID,
		});
		const guild = client.guilds.cache.get(client.settings.GUILD_ID);
		if (!guild) return console.error("Guild not found");

		for (const member of guild.members.cache.toJSON()) {
			if (
				!member.user.username.includes(serverModel.Tag) &&
				serverModel.FamilyRole.some((role) =>
					member.roles.cache.has(role),
				)
			) {
				let ekip = guild.roles.cache.get(`${serverModel.FamilyRole}`);

				if (member.manageable)
					await member.roles
						.set(
							member.roles.cache.filter(
								(x) => x.managed || x.position < ekip.position,
							),
						)
						.catch();

				if (member.manageable)
					member
						.setNickname(
							member.displayName.replace(
								serverModel.Tag
									? serverModel.Tag
									: serverModel.SecondaryTag,
								serverModel.SecondaryTag,
							),
						)
						.catch(console.error);
				if (serverModel && serverModel.TaggedMode == true) {
					if (
						!bannedTag ||
						(!bannedTag.taglar.length &&
							bannedTag.taglar.some(
								(x) =>
									!oldUser.username
										.toLowerCase()
										.includes(x.toLowerCase()) &&
									newUser.username
										.toLowerCase()
										.includes(x.toLowerCase()),
							)) ||
						(!member.permissions.has(
							Discord.PermissionsBitField.Flags.Administrator,
						) &&
							!member.user.bot &&
							!member.roles.cache.has(`${serverModel.VipRole}`) &&
							!member.roles.cache.has(
								`${serverModel.BoosterRole}`,
							) &&
							!member.roles.cache.has(
								`${serverModel.QuarantineRole}`,
							) &&
							!member.roles.cache.has(
								`${serverModel.BannedTagRole}`,
							) &&
							!member.roles.cache.has(
								`${serverModel.SuspectedRole}`,
							))
					)
						if (member.manageable)
							await member.roles
								.set(serverModel.UnregisteredRole)
								.catch(console.error);
				}
			}
			if (
				member.user.username.includes(serverModel.Tag) &&
				serverModel.FamilyRole.some(
					(role) => !member.roles.cache.has(role),
				)
			) {
				await member.roles.add(serverModel.FamilyRole);
				if (member.manageable)
					member
						.setNickname(
							member.displayName.replace(
								serverModel.SecondaryTag
									? serverModel.SecondaryTag
									: serverModel.Tag,
								serverModel.Tag,
							),
						)
						.catch(console.error);
			}
		}
	}

	client.taggedControl = control;
	async function spamMessage(message) {
		let server = await serverSettings.findOne({});
		let id = await cezalar.countDocuments().exec();
		if (server.GuildOwner.includes(message.author.id)) return;
		let data = {
			messageID: message.id,
			authorID: message.author.id,
			channelID: message.channel.id,
			content: message.content,
			sentTimestamp: message.createdTimestamp,
		};
		if (!client.spam.has(message.author.id)) {
			client.spam.set(message.author.id, {
				messages: [data],
				warncount: 0,
			});
		} else {
			client.spam.get(message.author.id).messages.push(data);
		}

		let info = client.spam.get(message.author.id);
		const spamMatches = info.messages.filter(
			(m) =>
				m.content !== message.content &&
				m.sentTimestamp > Date.now() - 7500,
		);

		let ACTIONS = new Map([
			[1, "30s"],
			[2, "1m"],
			[3, "5m"],
			[4, "10m"],
			[5, "30m"],
		]);

		if (spamMatches.length >= 6) {
			info.warncount++;
			info.messages = [];

			let time = ms(
				ACTIONS.get(info.warncount) ||
					(info.warncount - ACTIONS.size) * 1000 * 60 * 60 * 1,
			);
			await message.member.roles.add(server.ChatMuteRole);
			spamMatches.forEach((message) => {
				const channel = client.channels.cache.get(message.channelID);
				if (channel) {
					const msg = channel.messages.cache.get(message.messageID);
					if (msg && msg.deletable) msg.delete();
				}
			});

			await mutes.findOne(
				{ user: message.author.id },
				async (err, doc) => {
					const newMute = new mutes({
						user: message.author.id,
						muted: true,
						yetkili: client.user.id,
						endDate: Date.now() + time,
						start: Date.now(),
						sebep: "Spam",
					});
					await newMute.save().catch((e) => console.log(e));
				},
			);
			await cezalar
				.find({})
				.sort({ ihlal: "descending" })
				.exec(async (err, res) => {
					const newData = new cezalar({
						user: message.author.id,
						yetkili: client.user.id,
						ihlal: id + 1,
						ceza: "Chat Mute",
						sebep: "Spam",
						tarih: moment(Date.parse(new Date())).format("LLL"),
						bitiş: moment(Date.parse(new Date()) + time).format(
							"LLL",
						),
					});
					await newData.save().catch((e) => console.error(e));
				});
			setTimeout(() => {
				client.spam.get(message.author.id).warncount =
					client.spam.get(message.author.id).warncount - 1;
			}, ms("15m"));

			await message.channel.send({
				content: `Sohbet kanallarını kirletme sebebiyle ${await client.turkishDate(
					time,
				)} süresince susturuldunuz, mesajlar temizlendi. Lütfen yavaşlayın. ${
					message.author
				}`,
			});
		}
	}
	client.spamMessage = spamMessage;

	function yuzde(partialValue, totalValue) {
		return (100 * partialValue) / totalValue;
	}
	client.yuzde = yuzde;

	function ms(milliseconds) {
		const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

		return {
			days: roundTowardsZero(milliseconds / 86400000),
			hours: roundTowardsZero(milliseconds / 3600000) % 24,
			minutes: roundTowardsZero(milliseconds / 60000) % 60,
			seconds: roundTowardsZero(milliseconds / 1000) % 60,
			milliseconds: roundTowardsZero(milliseconds) % 1000,
			microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
			nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000,
		};
	}

	client.ms = ms;

	function send(mesaj, msg, kanal) {
		if (!mesaj || typeof mesaj !== "string") return;
		const embd = new Discord.EmbedBuilder()
			.setAuthor({
				name: msg.username,
				iconURL: msg.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Random")
			.setDescription(mesaj);
		kanal
			.send({ embeds: [embd] })
			.then((msg) => {
				{
					setTimeout(() => {
						msg.delete();
					}, 15000);
				}
			})
			.catch();
	}
	client.send = send;
};
