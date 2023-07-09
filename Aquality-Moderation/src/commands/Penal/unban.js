const Discord = require("discord.js");
const db = require("../../models/cantUnBan.js");
const { schema } = require("../../models/cantUnBan.js");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "unban",
		usage: "unban [@userID]",
		category: "Authorized",
		description: "Belirttiğiniz kişinin yasağını kaldırırsınız.",
		aliases: ["unban", "yasakkaldır"],
	},
	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		const whoisuseridd = args[0];
		if (isNaN(whoisuseridd))
			return client.send(
				"Lütfen geçerli bir kullanıcı ID'si giriniz.",
				message.author,
				message.channel,
			);
		if (
			!message.member.roles.cache.some((r) =>
				server.BanAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.Administrator,
			)
		)
			return;
		let sChannel = client.channels.cache.find(
			(channel) => channel.name === "unban-log",
		);

		const member = await client.users.fetch(whoisuseridd);
		await db.findOne({ user: member.id }, async (err, doc) => {
			const fetchBans = message.guild.bans.fetch();
			fetchBans.then(async (bans) => {
				let ban = await bans.find((a) => a.user.id === member.id);
				if (!ban) {
					client.send(
						"**" +
							member.username +
							"** üyesi zaten sunucuda yasaklı değil.",
						message.author,
						message.channel,
					);
					message.react(
						client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.no_name,
						),
					);
				} else if (doc) {
					client.send(
						"**" +
							member.username +
							"** üyesinin yasağı <@" +
							doc.mod +
							"> yetkilisi tarafından açılmaz olarak işaretlendi.",
						message.author,
						message.channel,
					);
					message.react(
						client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.no_name,
						),
					);
				} else {
					message.guild.members.unban(member.id);
					client.send(
						"**" +
							member.username +
							"** üyesinin yasağı <@" +
							message.author.id +
							"> tarafından kaldırıldı.",
						message.author,
						message.channel,
					);
					const embed = new Discord.EmbedBuilder()
						.setAuthor({
							name: message.author.username,
							iconURL: message.author.displayAvatarURL({
								dynamic: true,
							}),
						})
						.setColor("Random")
						.setDescription(
							"**" +
								member.username +
								"** üyesinin yasağı <@" +
								message.author.id +
								"> tarafından kaldırıldı.",
						);
					sChannel.send({ embeds: [embed] });
					message.react(
						client.emojis.cache.find(
							(x) => x.name === client.settings.emojis.yes_name,
						),
					);
				}
			});
		});
	},
};
