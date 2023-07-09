const Discord = require("discord.js");
const db = require("../../models/vrcRoleCommands");
module.exports = {
	conf: {
		name: "komutlar",
		category: "BotOwner",
		usage: "komutlar",
		description:
			"Botta bulunan tüm komutları ve detaylarının bilgilerini menü şeklinde gösterir.",
		aliases: ["komutlar", "commands"],
	},

	async run(client, message, args) {
		if (
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.Administrator,
			)
		)
			return;

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.StringSelectMenuBuilder()
				.setCustomId("commandshelp")
				.setPlaceholder("Benden yardım almak ister misin?")
				.addOptions([
					{
						label: "Üye Komutları",
						description: "Genel tüm komutları içerir.",
						value: "üye",
					},
					{
						label: "Teyit Komutları",
						description: "Genel tüm kayıt komutlarını içerir.",
						value: "teyit",
					},
					{
						label: "Yetkili Komutları",
						description: "Genel tüm yetkili komutlarını içerir.",
						value: "yetkili",
					},
					{
						label: "Yetenek ve diğer komutlar",
						description: "Genel tüm yetenek komutlarını içerir.",
						value: "yetenek",
					},
					{
						label: "Yönetim Komutları",
						description: "Genel tüm yönetim komutlarını içerir.",
						value: "yönetim",
					},
					{
						label: "Kurucu Komutları",
						description: "Genel tüm kurucu komutlarını içerir.",
						value: "kurucu",
					},
				]),
		);

		message.channel.send({
			content: `
**Merhaba!** Yardım almak ister misin?
Aşağıda bulunan menüden yardım almak istediğiniz kategoriyi seçin. :tada:`,
			components: [row],
		});
	},
};

client.on("interactionCreate", async (interaction) => {
	if (interaction.customId === "commandshelp") {
		if (interaction.values[0] === "üye") {
			interaction.reply({
				content: `\`\`\`Tüm üye komutlarının listesi;\n${client.commands
					.filter(
						(x) =>
							x.conf.category !== "-" &&
							x.conf.category == "Global",
					)
					.map((x) => [client.settings.PREFIX[0]] + x.conf.usage)
					.join("\n")}\`\`\``,
				ephemeral: true,
			});
		} else if (interaction.values[0] === "teyit") {
			interaction.reply({
				content: `\`\`\`Tüm teyit komutlarının listesi;\n${client.commands
					.filter(
						(x) =>
							x.conf.category !== "-" &&
							x.conf.category == "Register",
					)
					.map((x) => [client.settings.PREFIX[0]] + x.conf.usage)
					.join("\n")}\`\`\``,
				ephemeral: true,
			});
		} else if (interaction.values[0] === "yetkili") {
			interaction.reply({
				content: `\`\`\`Tüm yetkili komutlarının listesi;\n${client.commands
					.filter(
						(x) =>
							x.conf.category !== "-" &&
							x.conf.category == "Authorized",
					)
					.map((x) => [client.settings.PREFIX[0]] + x.conf.usage)
					.join("\n")}\`\`\``,
				ephemeral: true,
			});
		} else if (interaction.values[0] === "yönetim") {
			interaction.reply({
				content: `\`\`\`Tüm yönetim komutlarının listesi;\n${client.commands
					.filter(
						(x) =>
							x.conf.category !== "-" &&
							x.conf.category == "Management",
					)
					.map((x) => [client.settings.PREFIX[0]] + x.conf.usage)
					.join("\n")}\`\`\``,
				ephemeral: true,
			});
		} else if (interaction.values[0] === "kurucu") {
			interaction.reply({
				content: `\`\`\`Tüm kurucu komutlarının listesi;\n${client.commands
					.filter(
						(x) =>
							x.conf.category !== "-" &&
							x.conf.category == "Owner",
					)
					.map((x) => [client.settings.PREFIX[0]] + x.conf.usage)
					.join("\n")}\`\`\``,
				ephemeral: true,
			});
		} else if (interaction.values[0] === "yetenek") {
			let res = await db.find({});
			let komutlar = res.map((x) => `- ${x.cmdName}`).join("\n");
			interaction.reply({
				content: `\`\`\`Tüm yetenek komutlarının listesi;\n${
					komutlar.length ? komutlar : "Özel komut eklenmemiş."
				}\`\`\``,
				ephemeral: true,
			});
		}
	}
});
