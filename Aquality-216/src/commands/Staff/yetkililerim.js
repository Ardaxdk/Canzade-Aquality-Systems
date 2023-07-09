const Discord = require("discord.js");
const StaffModel = require("../../models/staff.js");
let serverSettings = require("../../models/serverSettings");
const { table } = require("table");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
	conf: {
		name: "yetkililerim",
		usage: ".yetkililerim",
		category: "Staff",
		description: "Yetkili olarak çektiğiniz kullanıcıları görürsünüz.",
		aliases: ["yetkililerim", "yetkilialdıklarım"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({});
		if (
			!message.member.roles.cache.some((r) =>
				server.RoleManageAuth.includes(r.id),
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
		await StaffModel.findOne({ userID: user.id }, async (err, res) => {
			let datax = [["ID", "Kullanıcı adı", "Tarih", "Yetkili mi?"]];

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
			res.yetkililer.map((x) => {
				let user = message.guild.members.cache.get(x);
				datax.push([
					x,
					user ? user.user.username : "(yok)",
					res.tarih.map((x) => x),
					user
						? `${
								user.user.username.includes(server.Tag)
									? "Yetkili"
									: "Yetki bırakmış."
						  }`
						: "Sunucudan ayrılmış",
				]);
			});
			let staffSayi = datax.length - 1;
			if (staffSayi == 0)
				return message.reply({
					content: `${user} kullanıcısının yetkili çekme bilgisi bulunmuyor.`,
				});

			let outi = table(datax.slice(0, 15), config);
			message.channel.send({
				content: `${
					message.author
				}, ${user} kişisinin son 15 yetkili çekme bilgileri aşağıda belirtilmiştir. (Toplam: ${staffSayi})
${Discord.codeBlock("fix", outi)}`,
			});
		});
	},
};
