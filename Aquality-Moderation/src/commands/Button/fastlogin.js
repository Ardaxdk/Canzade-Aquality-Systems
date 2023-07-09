const Discord = require("discord.js");
let serverSettings = require("../../models/serverSettings");
const ms = require("ms");
const Cooldowns = new Discord.Collection();
module.exports = {
	conf: {
		name: "fastlogin",
		usage: "giriş",
		category: "BotOwner",
		description: "Kullanıcı hızlı giriş mesajını attırmaya sağlar.",
		aliases: ["giriş", "fastlogin", "login"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("fastlogin")
				.setLabel("Doğrula")
				.setStyle(Discord.ButtonStyle.Success),
		);

		message.channel.send({
			content: `
**Merhaba Kullanıcı;**

Sunucumuz şuan çok hızlı giriş işlemi yapıldığı için rol dağıtımı durduruldu. Aşağıdaki butona tıklayarak bot hesap olmadığını doğrulayıp sunucuda gerekli rollerini alabilirsin. Eğer yanlış bir durum olduğunu düşünüyorsan sağ taraftaki yetkililere yazmaktan çekinme!

_Eğer bu kanalı anlık olarak gördüysen kayıt işlemine <#${server.RegisterChat}> bu kanaldan devam edebilirsin_

İyi günler dileriz.

**${message.guild.name}**
`,
			components: [row],
		});
	},
};

client.on("interactionCreate", async (interaction) => {
	let server = await serverSettings.findOne({
		guildID: interaction.guild.id,
	});
	if (interaction.customId === "fastlogin") {
		let ButtonCooldowns = Cooldowns.get(interaction.customId);

		if (!ButtonCooldowns) {
			ButtonCooldowns = new Discord.Collection();
			Cooldowns.set(interaction.customId, ButtonCooldowns);
		}
		const userCooldown = ButtonCooldowns.get(interaction.user.id);
		const now = Date.now();
		if (userCooldown) {
			if (now - userCooldown < 100_000)
				return interaction.reply({
					content: `Butonlarla hızlı işlem yaptığınız için yavaşlatıldınız! Bir zaman sonra tekrar deneyin.`,
					ephemeral: true,
				});
			else ButtonCooldowns.set(interaction.user.id, now);
		} else ButtonCooldowns.set(interaction.user.id, now);

		if (server.AUTO_ROLE)
			return interaction.reply({
				content: `Bu sistem yalnızca sunucuya fake hesap istilası olduğunda devreye girer, eğer bu saçma mesajı alıyorsan sunucudan çıkıp tekrardan girmen gerekiyor.`,
				ephemeral: true,
			});
		if (Date.now() - interaction.user.createdTimestamp < ms("7d")) {
			await interaction.member.roles.set(server.SuspectedRole);
			interaction.reply({
				content:
					"Sahte bir hesaba sahip olduğunuz için cezalıya atıldınız.",
				ephemeral: true,
			});
		} else {
			interaction.member.roles.add(server.UnregisteredRole);

			interaction.reply({
				content:
					"Doğrulama başarılı teyit kanallarına yönlendiriliyorsunuz.",
				ephemeral: true,
			});
		}
	}
});
