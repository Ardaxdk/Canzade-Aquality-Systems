const Discord = require("discord.js");
const axios = require("axios");
module.exports = {
	conf: {
		name: "banner",
		usage: "banner [@user]",
		category: "Global",
		description: "Belirttiğiniz kullanıcının bannerini görüntülersiniz.",
		aliases: ["user-banner", "kbanner"],
	},

	async run(client, message, args) {
		// let user = args.length > 0 ? message.mentions.users.first() || await client.users.fetch(args[0]) || message.author : message.author
		let user =
			message.mentions.users.first() ||
			client.users.cache.get(args[0]) ||
			(args[0] && args[0].length
				? client.users.cache.find((x) =>
						x.username.match(new RegExp(args.join(" "), "mgi")),
				  )
				: null) ||
			null;
		if (!user)
			try {
				user = await client.users.fetch(args[0]);
			} catch (err) {
				user = message.author;
			}

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.StringSelectMenuBuilder()
				.setCustomId("avatar")
				.setPlaceholder("Avatarını görüntülemek için tıkla!")
				.addOptions([
					{
						label: "Avatar",
						description: "Kullanıcının avatarını görüntülersiniz.",
						value: "avatar",
					},
				]),
		);

		async function bannerURL(user, client) {
			const response = await axios.get(
				`https://discord.com/api/v9/users/${user}`,
				{ headers: { Authorization: `Bot ${client.token}` } },
			);
			if (!response.data.banner)
				return "Kullanıcının banneri bulunmamakta!";
			if (response.data.banner.startsWith("a_"))
				return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.gif?size=512`;
			else
				return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.png?size=512`;
		}

		let bannerurl = await bannerURL(user.id, client);

		let msg = await message.channel.send({
			content: `${bannerurl}`,
			components: [row],
		});
		var filter = (menu) => menu.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			max: 1,
			time: 30000,
		});

		collector.on("collect", async (menu) => {
			if (menu.values[0] === "avatar") {
				menu.reply({
					content: `> ${Discord.hyperlink(
						`${user.username}`,
						`${user.displayAvatarURL({
							dynamic: true,
							size: 4096,
						})}`,
						"Resimi büyütmek için tıkla",
					)}`,
					ephemeral: true,
				});
			}
		});
	},
};
