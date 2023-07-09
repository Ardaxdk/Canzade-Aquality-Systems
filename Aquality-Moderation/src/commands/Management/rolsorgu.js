const Discord = require("discord.js");
module.exports = {
	conf: {
		name: "rol",
		usage: "rol [@rol]",
		category: "Management",
		description: "Belirttiğiniz rolün rol bilgilerini gösterir.",
		aliases: ["rolsorgu"],
	},

	async run(client, message, args) {
		if (
			!message.member.roles.cache.some((r) =>
				server.RoleManageAuth.includes(r.id),
			) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ViewAuditLog,
			)
		)
			return;
		let role =
			message.mentions.roles.first() ||
			message.guild.roles.cache.get(args[0]);
		if (!args[0])
			return message.reply({
				content:
					"Rol bilgisine bakmak istediğin rolü belirt ve tekrar dene!",
			});
		if (!role)
			return message.reply({
				content:
					"Belirtmiş olduğun rolü bulamadım! Düzgün bir rol etiketle veya ID belirtip tekrar dene.",
			});
		let sayı = role.members.size;
		if (sayı > 200)
			return message.channel.send({
				content: `${role} rolünde toplam ${sayı} kişi olduğundan dolayı rol bilgisini yollayamıyorum.`,
			});
		let members = role.members.map((x) => `<@${x.id}> - (\`${x.id}\`) `);
		message.channel.send({
			content: `- ${role} rol bilgileri;
- Rol Rengi: \`${role.hexColor}\`
- Rol ID: \`${role.id}\`
- Rol Kişi Sayısı: \`${sayı}\`
─────────────────
- Roldeki Kişiler: 
${members.join("\n")}
        `,
			split: true,
		});
	},
};
