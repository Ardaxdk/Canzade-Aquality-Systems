const Discord = require("discord.js");
const moment = require("moment");
const axios = require("axios");
require("moment-duration-format");
moment.locale("tr");
module.exports = {
	conf: {
		name: "profil",
		usage: "profil [@user]",
		category: "Authorized",
		description: "Belirttiğiniz kişinin profil bilgilerini görürsünüz.",
		aliases: ["profil", "i"],
	},

	async run(client, message, args) {
		if (
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let user =
			args.length > 0
				? message.mentions.users.first() ||
				  (await client.users
						.fetch(args[0])
						.catch((e) => console.log(e))) ||
				  message.author
				: message.author;
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: user.username,
				iconURL: user.displayAvatarURL({ dynamic: true }),
			})
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setColor("Random")
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			})
			.addFields([
				{
					name: "❯ Kullanıcı Bilgisi",
					value:
						"`•` Hesap: <@" +
						user.id +
						">\n`•` Kullanıcı ID: " +
						user.id +
						"\n`•` Kuruluş Tarihi: <t:" +
						Math.floor(user.createdTimestamp / 1000) +
						"> - (<t:" +
						Math.floor(user.createdTimestamp / 1000) +
						":R>)",
					inline: false,
				},
			]);
		message.reply({ embeds: [embed] });
		if (message.guild.members.cache.has(user.id)) {
			let member = message.guild.members.cache.get(user.id);
			let nickname =
				member.displayName == user.username
					? "" + user.username + " [Yok] "
					: member.displayName;
			const members = [
				...message.guild.members.cache
					.filter((x) => !x.user.bot)
					.values(),
			].sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
			const joinPos = members.map((u) => u.id).indexOf(member.id);
			const previous = members[joinPos - 1]
				? members[joinPos - 1].user
				: null;
			const next = members[joinPos + 1]
				? members[joinPos + 1].user
				: null;
			const roles = member.roles.cache
				.filter((role) => role.id !== message.guild.id)
				.sort((a, b) => b.position - a.position)
				.map((role) => `<@&${role.id}>`);
			const rolleri = [];
			if (roles.length > 6) {
				const lent = roles.length - 6;
				let itemler = roles.slice(0, 6);
				itemler.map((x) => rolleri.push(x));
				rolleri.push(`${lent} daha...`);
			} else {
				roles.map((x) => rolleri.push(x));
			}

			const bilgi = `${previous ? `**${previous.username}** > ` : ""}<@${
				user.id
			}>${next ? ` > **${next.username}**` : ""}`;
			embed.addFields([
				{
					name: "❯ Sunucu Bilgisi",
					value:
						"`•` Sunucu İsmi: " +
						nickname +
						"\n`•` Katılım Tarihi: <t:" +
						Math.floor(member.joinedAt / 1000) +
						"> - (<t:" +
						Math.floor(member.joinedAt / 1000) +
						":R>)\n`•` Katılım Sırası: " +
						joinPos +
						"/" +
						message.guild.members.cache.size +
						"\n`•` Katılım Bilgisi: " +
						bilgi +
						"\n\n`•` Rolleri (" +
						roles.length +
						"): " +
						rolleri.join(", ") +
						" ",
					inline: false,
				},
			]);
			embed.setColor(member.displayHexColor);
			embed.setImage(await bannerURL(user.id, client));
			embed.setFooter({
				text: message.author.username,
				iconURL: message.author.avatarURL({ display: true }),
			});

			message.reply({ embeds: [embed] });
			async function bannerURL(user, client) {
				const response = await axios.get(
					`https://discord.com/api/v9/users/${user}`,
					{ headers: { Authorization: `Bot ${client.token}` } },
				);
				if (!response.data.banner) return;
				if (response.data.banner.startsWith("a_"))
					return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.gif?size=512`;
				else
					return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.png?size=512`;
			}
		}
	},
};
