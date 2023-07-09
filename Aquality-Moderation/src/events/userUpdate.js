const moment = require("moment");
const Discord = require("discord.js");
const data = require("../models/yasaklıtag");
let serverSettings = require("../models/serverSettings");

module.exports = async (oldUser, newUser) => {
	let server = await serverSettings.findOne({});
	const bannedTag = await data.findOne({
		guild: client.settings.GUILD_ID,
	});

	let tag = server.Tag;
	let ikinciTag = server.SecondaryTag;
	let member = newUser.client.guilds.cache
		.get(client.settings.GUILD_ID)
		.members.cache.get(newUser.id);
	let ekip = member.guild.roles.cache.get(`${server.FamilyRole}`);

	let tagsayı = client.users.cache.filter((user) =>
		user.username.includes(tag),
	).size;

	if (!oldUser.username.includes(tag) && newUser.username.includes(tag)) {
		await member.roles.add(ekip).catch(console.error);
		if (member.manageable)
			member
				.setNickname(member.displayName.replace(ikinciTag, tag))
				.catch(console.error);

		client.channels.cache
			.find((channel) => channel.name === "join-family")
			.send({
				content: `
${member} adlı üye ( ${tag} ) tagını kullanıcı adına ekleyerek ailemize katıldı! | Sunucuda bulunan toplam taglı üyemiz: (${tagsayı}) 
─────────────────
Önce: ${oldUser.username} | Sonra: ${newUser.username}`,
			})
			.catch();
	} else if (
		oldUser.username.includes(tag) &&
		!newUser.username.includes(tag)
	) {
		if (member.manageable)
			member
				.setNickname(member.displayName.replace(tag, ikinciTag))
				.catch(console.error);
		if (server && server.TaggedMode == true) {
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
					!member.roles.cache.has(`${serverModel.BoosterRole}`) &&
					!member.roles.cache.has(`${serverModel.QuarantineRole}`) &&
					!member.roles.cache.has(`${serverModel.BannedTagRole}`) &&
					!member.roles.cache.has(`${serverModel.SuspectedRole}`))
			)
				await member.roles
					.set(server.UnregisteredRole)
					.catch(console.error);
		} else if (member.manageable)
			await member.roles
				.set(
					member.roles.cache.filter(
						(x) => x.managed || x.position < ekip.position,
					),
				)
				.catch();

		if (server.BotCommandRole.some((x) => member.roles.cache.has(x))) {
			client.channels.cache
				.find((channel) => channel.name === "yetkili-tag")
				.send({
					content: `
${newUser} adlı üye **${moment(Date.now())
						.locale("tr")
						.format("LLL")}** tarihinde yetkiyi bıraktı.
Bırakmadan önceki yetkileri:\n${member.roles.cache
						.filter(
							(rol) =>
								ekip.position <= rol.position && !rol.managed,
						)
						.map((x) => `<@&${x.id}>`)}
    `,
				});
		} else
			client.channels.cache
				.find((channel) => channel.name === "leave-family")
				.send({
					content: `
${member} adlı üye ( ${tag} ) tagını kullanıcı adından silerek aramızdan ayrıldı! | Sunucuda bulunan toplam taglı üyemiz: (${tagsayı}) 
─────────────────
Önce: ${oldUser.username} | Sonra: ${newUser.username}`,
				})
				.catch();
	}

	if (!bannedTag || !bannedTag.taglar.length) return;
	if (
		bannedTag.taglar.some(
			(x) =>
				!oldUser.username.toLowerCase().includes(x.toLowerCase()) &&
				newUser.username.toLowerCase().includes(x.toLowerCase()),
		)
	) {
		if (member.manageable)
			await member.roles
				.set(
					member.roles.cache.has(server.BoosterRole)
						? (server.BoosterRole, server.BannedTagRole)
						: server.BannedTagRole,
				)
				.catch((e) => console.log(e));
		member
			.send({
				content:
					"İsmine almış olduğun tag sunucumuzun yasaklı taglar listesinde bulunduğu için sunucumuza olan erişimin kesildi. İsmindeki yasaklı tagı çıkardığın zaman sunucumuza olan erişimin tekrardan aktif hale gelecektir.",
			})
			.catch((e) => console.log(e));
		client.channels.cache
			.find((channel) => channel.name === "yasaklı-tag")
			.send({
				content: `
${newUser} üyesi sunucumuzda yasaklı taglar arasında bulunan taglardan birini aldı.

Önce: \`${oldUser.username}\` 
Sonra: \`${newUser.username}\``,
			});
	} else if (
		bannedTag.taglar.some(
			(x) =>
				oldUser.username.toLowerCase().includes(x.toLowerCase()) &&
				!newUser.username.toLowerCase().includes(x.toLowerCase()),
		)
	) {
		member
			.send({
				content:
					"Daha önceden ismine almış olduğun sunucumuzda yasaklı taglar listesinde bulunan tagı isminden çıkardığın için sunucumuza olan erişimin tekrardan aktif hale getirildi. Teyit kanallarına girip kayıt olabilirsin, iyi eğlenceler!",
			})
			.catch((e) => console.log(e));
		client.channels.cache
			.find((channel) => channel.name === "yasaklı-tag")
			.send({
				content: `
${newUser} üyesi sunucumuzda yasaklı taglar arasında bulunan taglardan birini bıraktı.

Önce: \`${oldUser.username}\` 
Sonra: \`${newUser.username}\``,
			});
		if (member.manageable)
			await member.roles
				.set(
					member.roles.cache.has(server.BoosterRole)
						? (server.BoosterRole, server.UnregisteredRole)
						: server.UnregisteredRole,
				)
				.catch((e) => console.log(e));
	}
};

module.exports.conf = {
	name: "userUpdate",
};
