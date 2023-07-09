const mongoose = require("mongoose");
const Discord = require("discord.js");
const cezalar = require("../models/cezalar.js");
const extra = require("../models/extraMute.js");
let serverSettings = require("../models/serverSettings");
const can = require("pretty-ms");
const ms = require("ms");

module.exports = async (client) => {
	async function createuser({ id: userID }, isLean) {
		return new Promise(async (resolve) => {
			if (client.databaseCache.users.get(userID)) {
				resolve(
					isLean
						? client.databaseCache.users.get(userID).toJSON()
						: client.databaseCache.users.get(userID),
				);
			} else {
				let userData = isLean
					? await client.usersData.findOne({ id: userID }).lean()
					: await client.usersData.findOne({ id: userID });
				if (userData) {
					resolve(userData);
				} else {
					userData = new client.usersData({ id: userID });
					await userData.save();
					resolve(isLean ? userData.toJSON() : userData);
				}
				client.databaseCache.users.set(userID, userData);
			}
		});
	}
	client.createuser = createuser;

	function kaldır(arr, value) {
		var i = 0;
		while (i < arr.length) {
			if (arr[i] === value) {
				arr.splice(i, 1);
			} else {
				++i;
			}
		}
		return arr;
	}

	client.kaldır = kaldır;

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

	function turkishDate(date) {
		if (!date || typeof date !== "number") return;
		let convert = can(date, { verbose: true })
			.replace("minutes", "dakika")
			.replace("minute", "dakika")
			.replace("hours", "saat")
			.replace("hour", "saat")
			.replace("seconds", "saniye")
			.replace("second", "saniye")
			.replace("days", "gün")
			.replace("day", "gün")
			.replace("years", "yıl")
			.replace("year", "yıl");
		return convert;
	}
	client.turkishDate = turkishDate;

	async function findOrCreateUser({ id: userID }, isLean) {
		return new Promise(async (resolve) => {
			if (client.databaseCache.users.get(userID)) {
				resolve(
					isLean
						? client.databaseCache.users.get(userID).toJSON()
						: client.databaseCache.users.get(userID),
				);
			} else {
				let userData = isLean
					? await client.usersData.findOne({ id: userID }).lean()
					: await client.usersData.findOne({ id: userID });
				if (userData) {
					resolve(userData);
				} else {
					userData = new client.usersData({ id: userID });
					await userData.save();
					resolve(isLean ? userData.toJSON() : userData);
				}
				client.databaseCache.users.set(userID, userData);
			}
		});
	}
	client.findOrCreateUser = findOrCreateUser;

	async function cezasayı(user) {
		let arr = [];
		await cezalar.find(
			{
				user: user,
			},
			async (err, res) => {
				res.map((x) => {
					arr.push(x.ceza);
				});
			},
		);
		return arr.length;
	}

	client.cezasayı = cezasayı;

	async function punishPoint(userID) {
		let res = await cezalar.find({ user: userID });
		if (!res) return 0;
		let filterArr = res.map((x) => x.ceza);
		let chatMute = filterArr.filter((x) => x == "Chat Mute").length || 0;
		let voiceMute = filterArr.filter((x) => x == "Voice Mute").length || 0;
		let jail = filterArr.filter((x) => x == "Cezalı").length || 0;
		let ban = filterArr.filter((x) => x == "Yasaklı").length || 0;
		let uyarı = filterArr.filter((x) => x == "Uyarı").length || 0;

		let point =
			chatMute * 8 + voiceMute * 10 + jail * 15 + ban * 20 + uyarı * 3;
		return point;
	}

	client.punishPoint = punishPoint;

	async function extraMute(userID, type, time) {
		let res = await extra.findOne({ user: userID });
		if (!res) {
			let buffer = new extra({
				__id: new mongoose.Types.ObjectId(),
				user: userID,
				array: [
					{
						type: type,
						attendeAt: Date.now(),
						time: time,
					},
				],
			});
			await buffer.save().catch((e) => console.log(e));
			return 0;
		}
		if (res.array.length == 0) return 0;

		if (res && res && res.array.filter((a) => a.type == type).length == 0) {
			res.array.push({
				type: type,
				attendeAt: Date.now(),
				time: time,
			});
			await res.save().catch((e) => console.log(e));
			return 0;
		}

		let datx = res.array.filter(
			(a) =>
				a.type == type &&
				Date.now() - a.attendeAt < ms("12h") &&
				a.time == time,
		);
		if (datx.length == 0) return 0;

		res.array = res.array.filter(
			(a) => Date.now() - a.attendeAt < ms("12h"),
		);

		res.array.push({
			type: type,
			attendeAt: Date.now(),
			time: time,
		});
		await res.save().catch((e) => console.log(e));
		return datx.length;
	}
	client.extraMute = extraMute;

	async function clean(text) {
		if (text && text.constructor.name == "Promise") text = await text;
		if (typeof text !== "string")
			text = require("util").inspect(text, { depth: 1 });

		text = text
			.replace(/`/g, "`" + String.fromCharCode(8203))
			.replace(/@/g, "@" + String.fromCharCode(8203))
			.replace(client.token, client.client.settings.BOT_TOKEN);

		return text;
	}
	client.clean = clean;

	async function fetchPunishments() {
		let res = await cezalar.find();
		if (res.length == 0) return 0;
		let last = await res.sort((a, b) => {
			return b.ihlal - a.ihlal;
		})[0];
		return last.ihlal;
	}
	client.fetchPunishments = fetchPunishments;

	function shuffle(array) {
		var currentIndex = array.length,
			temporaryValue,
			randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	client.shuffle = shuffle;

	async function üye(search, guild) {
		let member = null;
		if (!search || typeof search !== "string") return;
		if (search.match(/^<@!?(\d+)>$/)) {
			let id = search.match(/^<@!?(\d+)>$/)[1];
			member = await guild.members.fetch(id).catch(() => {});
			if (member) return member;
		}
		if (search.match(/^!?([^#]+)#(\d+)$/)) {
			guild = await guild.fetch();
			member = guild.members.cache.find(
				(m) => m.user.username === search,
			);
			if (member) return member;
		}
		member = await guild.members.fetch(search).catch(() => {});
		return member;
	}
	client.üye = üye;

	async function client_üye(search) {
		let user = null;
		if (!search || typeof search !== "string") return;
		if (search.match(/^!?([^#]+)#(\d+)$/)) {
			let id = search.match(/^!?([^#]+)#(\d+)$/)[1];
			user = client.users.fetch(id).catch((err) => {});
			if (user) return user;
		}
		user = await client.users.fetch(search).catch(() => {});
		return user;
	}
	client.client_üye = client_üye;

	let kufurler = ["za"];

	function chatKoruma(mesajIcerik) {
		if (!mesajIcerik) return;
		let inv =
			/(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;
		if (inv.test(mesajIcerik)) return true;

		let link =
			/(http[s]?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;
		if (link.test(mesajIcerik)) return true;

		if (
			kufurler.some((word) =>
				new RegExp("(\\b)+(" + word + ")+(\\b)", "gui").test(
					mesajIcerik,
				),
			)
		)
			return true;
		return false;
	}
	client.chatKoruma = chatKoruma;
};
