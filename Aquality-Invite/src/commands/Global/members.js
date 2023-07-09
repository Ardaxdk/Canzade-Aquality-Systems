const InviteModel = require("../../models/inviteMember");
const Discord = require("discord.js");
const { table } = require("table");
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
	conf: {
		name: "üyeler",
		usage: ".üyeler",
		category: "Global",
		description: "Sunucuya davet ettiğiniz kişilerin listesini görürsünüz.",
		aliases: ["uyeler", "sondavet", "üyeler"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});
		let user =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;
		let datax = [["ID", "Kullanıcı adı", "Tarih", "Taglı?"]];
		let config = {
			border: {
				topBody: ``,
				topJoin: ``,
				topLeft: ``,
				topRight: ``,

				bottomBody: ``,
				bottomJoin: ``,
				bottomLeft: ``,
				bottomRight: ``,

				bodyLeft: `│`,
				bodyRight: `│`,
				bodyJoin: `│`,

				joinBody: ``,
				joinLeft: ``,
				joinRight: ``,
				joinJoin: ``,
			},
		};
		const data = await InviteModel.find({
			guildID: message.guild.id,
			inviter: user.id,
		});
		const filtered = data.filter((x) =>
			message.guild.members.cache.get(x.userID),
		);

		if (filtered.length == 0)
			return message.reply(
				`${message.author}, ${user} kişisine ait veri bulunamadı.`,
			);

		filtered.map((x) => {
			let user = message.guild.members.cache.get(x.userID);
			datax.push([
				x.userID,
				user ? user.user.username : "(yok)",
				x.date,
				user
					? `${
							user.user.username.includes(server.Tag)
								? "Taglı"
								: "Taglı değil"
					  }`
					: "Sunucudan ayrılmış",
			]);
		});

		let outi = table(datax.slice(0, 15), config);
		message.channel.send({
			content: `${
				message.author
			}, ${user} kişisinin davet bilgileri aşağıda belirtilmiştir.
${Discord.codeBlock("fix", outi)}`,
		});
	},
};
