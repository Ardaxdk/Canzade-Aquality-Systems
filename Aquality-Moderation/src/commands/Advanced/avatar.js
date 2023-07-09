const Discord = require("discord.js");
const axios = require("axios");
module.exports = {
	conf: {
		name: "avatar",
		usage: "avatar [@user]",
		category: "Global",
		description: "Belirttiğiniz kullanıcının avatarını görüntülersiniz.",
		aliases: ["av", "pp"],
	},

	async run(client, message, args) {
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
				.setCustomId("banner")
				.setPlaceholder(
					"Kullanıcının bannerini görüntülemek için tıkla!",
				)
				.addOptions([
					{
						label: "Banner",
						description: "Kullanıcının bannerini görüntüleyin.",
						value: "banner",
					},
				]),
		);
		const avatar = `${user.displayAvatarURL({
			dynamic: true,
			size: 4096,
		})}`;

		let msg = await message.reply({
			content: `${avatar}`,
			components: [row],
		});
		var filter = (menu) => menu.user.id === message.author.id;
		const collector = msg.createMessageComponentCollector({
			filter,
			max: 1,
			time: 30000,
		});

		collector.on("collect", async (menu) => {
			if (menu.values[0] === "banner") {
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
				menu.reply({
					content: `> ${Discord.hyperlink(
						`${user.username}`,
						`${bannerurl}`,
						"Resimi büyütmek için tıkla",
					)}`,
					ephemeral: true,
				});
			}
		});
	},
};
