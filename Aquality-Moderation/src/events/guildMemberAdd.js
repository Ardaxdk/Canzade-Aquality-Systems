const cezalar = require("../models/cezalı.js");
const mute = require("../models/chatmute.js");
const data = require("../models/yasaklıtag.js");
let serverSettings = require("../models/serverSettings");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = async (member) => {
	let server = await serverSettings.findOne({});
	let cezalıDB = await cezalar.findOne({ user: member.id });
	let mutedDB = await mute.findOne({ user: member.id });
	const bannedTag = await data.findOne({ guild: member.guild.id });

	const ONE_DAY = 1000 * 60 * 60 * 24;
	const SUSPECT_TIME = 7;
	const IN_TIMES = 1 * 60 * 1000;
	const MAX_ACCOUNTS = 6;

	const now = Date.now();
	const fakeAccounts = member.guild.members.cache.filter(
		(member) =>
			(now - member.user.createdAt) / ONE_DAY < SUSPECT_TIME &&
			now - member.joinedAt < IN_TIMES,
	).size;

	if (fakeAccounts >= MAX_ACCOUNTS) {
		server.AUTO_ROLE = false;
		await server.save();
		client.logger.log(
			`Fake hesap istilası tespit edildi. Sunucuya ${MAX_ACCOUNTS} adet hesabını 7 gün önce oluşturmuş kullanıcı giriş yaptı, otorol otomatik olarak kapatıldı.`,
			"warn",
		);
		client.guild.channels.cache
			.get(server.RegisterChat)
			.send(
				`Fake hesap istilası tespit edildi. Sunucumuza 1 dakika içerisinde ${MAX_ACCOUNTS} fake hesap giriş yaptığı için otorol işlemi durduruldu. Lütfen bu süreç içerisinde yetki sahibi kişilerin müdahalesini bekleyin.`,
			);
	} else if (server.AUTO_ROLE) {
		if (Date.now() - member.user.createdTimestamp < ms("7d")) {
			await member.roles.set(server.SuspectedRole);
		} else if (
			bannedTag &&
			bannedTag.taglar.length &&
			bannedTag.taglar.some((x) => member.user.username.includes(x))
		) {
			await member.roles.set(server.BannedTagRole);
			member
				.send(
					"Sunucumuza isminde bulunan yasaklı taglardan birisi ile giriş yaptığın için, erişimin kapatıldı. İsminde ki tagı çıkardıkan sonra sunucumuza erişebileceksin. Sağlıcakla kal!",
				)
				.catch();
		} else {
			await member.roles.add(server.UnregisteredRole);
			if (member.user.username.includes("" + server.Tag + ""))
				member.roles.add(server.FamilyRole);

			if (cezalıDB && cezalıDB.ceza == true)
				await member.roles.set(server.QuarantineRole);
			if (mutedDB && mutedDB.muted == true)
				member.roles.add(server.ChatMuteRole);
		}
	}

	/*let otorolRoleId = "1013200754623926329";
	let accounts = new Map();
	let otorolActive = true;

	if (otorolActive) {
		const created =
			(Date.now() - member.user.createdAt) / (1000 * 60 * 60 * 24);
		if (created < 7) {
			console.log(
				`${member.user.tusernameag} hesabı 7 günden daha eski olduğu için otorol verilmeyecek.`,
			);
			return;
		}

		accounts.set(member.user.id, Date.now());
		//if (accounts.size >= 1) {
		let oldestTime = Date.now();
		let invalidAccounts = 0;
		for (let [userId, time] of accounts.entries()) {
			if (Date.now() - time > 5 * 60 * 1000) {
				accounts.delete(userId);
				console.log(
					`${
						client.users.cache.get(userId).username
					} hesabı 5 dakikadan fazla süredir sunucuya katılmadığı için silindi.`,
				);
			} else {
				oldestTime = Math.min(oldestTime, time);
				const created =
					(Date.now() - client.users.cache.get(userId).createdAt) /
					(1000 * 60 * 60 * 24);
				if (created < 20) {
					invalidAccounts++;
				}
			}
			//	}
			if (invalidAccounts >= 2) {
				console.log(
					`Otorol sistemi otomatik olarak kapatıldı. 5 adet 1 günden önce oluşturulmuş hesap sunucuya katıldı.`,
				);
				accounts.clear();
				otorolActive = false;
				return;
			}
		}
		member.roles.add(otorolRoleId);
		console.log(`${member.user.username} kullanıcısına otorol verildi.`);
	}*/

	/*	let channels = member.guild.channels.cache.filter(
				(ch) =>
					ch.parentId == server.RegisterParent &&
					ch.type == Discord.ChannelType.GuildVoice,
			);

			let kontrol = Date.now() - member.user.createdTimestamp < ms("5d");
			client.channels.cache.get(server.RegisterChat).send(`
🎉 ${member.guild.name}' e hoş geldin ${member} 🎉

\`••❯\` Hesabın <t:${Math.floor(
				member.user.createdTimestamp / 1000,
			)}> tarihinde (<t:${Math.floor(
				member.user.createdTimestamp / 1000,
			)}:R>) oluşturulmuş. ${
				kontrol
					? client.emojis.cache.find(
							(x) =>
								x.name === client.settings.emojis.no_name,
					  )
					: client.emojis.cache.find(
							(x) =>
								x.name === client.settings.emojis.yes_name,
					  )
			}

\`••❯\` Sunucu kurallarımız kurallar kanalında belirtilmiştir. Unutma sunucu içerisinde ki ceza işlemlerin kuralları okuduğunu varsayarak gerçekleştirilecek.

\`••❯\` Sunucumuzun **${
				member.guild.members.cache.size
			}.** üyesisin! Tagımızı (\`${
				server.Tag
			}\`) alarak bizlere destek olabilirsin. Kayıt olmak için teyit odalarına girip ses teyit vermen gerekiyor yetkililerimiz seninle ilgilenecektir! İyi eğlenceler.

**>${client.emojis.cache.find(
				(x) => x.name === "yukleniyorgif",
			)} ${channels.random()} Kanalına girerek saniyeler içerisinde kayıt olabilirsiniz. <**
`);*/

	/*if (Date.now() - member.user.createdTimestamp < ms("7d")) {
		await member.roles.set(server.SuspectedRole);
	} else if (
		bannedTag &&
		bannedTag.taglar.length &&
		bannedTag.taglar.some((x) => member.user.username.includes(x))
	) {
		await member.roles.set(server.BannedTagRole);
		member
			.send(
				"Sunucumuza isminde bulunan yasaklı taglardan birisi ile giriş yaptığın için, erişimin kapatıldı. İsminde ki tagı çıkardıkan sonra sunucumuza erişebileceksin. Sağlıcakla kal!",
			)
			.catch();
	} else {
		await member.roles.add(server.UnregisteredRole);
		if (member.user.username.includes("" + server.Tag + ""))
			member.roles.add(server.FamilyRole);

		if (cezalıDB && cezalıDB.ceza == true)
			await member.roles.set(server.QuarantineRole);
		if (mutedDB && mutedDB.muted == true)
			member.roles.add(server.ChatMuteRole);
	}*/
};

module.exports.conf = {
	name: "guildMemberAdd",
};
