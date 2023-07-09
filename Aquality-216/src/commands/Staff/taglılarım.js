const Discord = require("discord.js");
const TaggedModel = require("../../models/tagged.js");
let serverSettings = require("../../models/serverSettings.js");
const { table } = require("table");
const moment = require("moment");
const staff = require("../../models/staff.js");
require("moment-duration-format");
module.exports = {
	conf: {
		name: "taglılarım",
		usage: ".taglılarım",
		category: "Staff",
		description: "Taglı olarak işaretlediğiniz kullanıcıları görürsünüz.",
		aliases: ["taglilarım", "taglilarim"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});

		if (
			!message.member.roles.cache.some((r) =>
				server.BotCommandRole.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let user =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.member;
		await TaggedModel.findOne({ userID: user.id }, async (err, res) => {
			let datax = [["ID", "Kullanıcı adı", "Tarih", "Taglı mı?"]];

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
			res.taglılar.map((x) => {
				let user = message.guild.members.cache.get(x);
				datax.push([
					x,
					user ? user.user.username : "(yok)",
					res.tarih.map((x) => x),
					user
						? `${
								user.user.username.includes(server.Tag)
									? "Taglı"
									: "Tagsız."
						  }`
						: "Sunucudan ayrılmış",
				]);
			});
			let staffSayi = datax.length - 1;
			if (staffSayi == 0)
				return message.reply({
					content: `${user} kullanıcısının taglı işaretleme bilgisi bulunmuyor.`,
				});

			let outi = table(datax.slice(0, 15), config);
			message.channel.send({
				content: `${
					message.author
				}, ${user} kişisinin son 15 taglı işaretleme bilgileri aşağıda belirtilmiştir. (Toplam: ${staffSayi})
${Discord.codeBlock("fix", outi)}`,
			});
		});
	},
};
