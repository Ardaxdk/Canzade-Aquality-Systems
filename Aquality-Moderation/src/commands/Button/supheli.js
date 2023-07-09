const Discord = require("discord.js");
const Cooldowns = new Discord.Collection();
let serverSettings = require("../../models/serverSettings");
const moment = require("moment");
const ms = require("ms");
module.exports = {
	conf: {
		name: "şüphelikontrol",
		usage: "suphelikontrol",
		category: "BotOwner",
		description: "Kullanıcı şüpheli kontrol mesajını attırmaya sağlar.",
		aliases: ["suphelikontrol", "suphelimesaj"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("suphekontrol")
				.setLabel("Doğrula")
				.setStyle(Discord.ButtonStyle.Secondary),
		);

		message.channel.send({
			content: `\`\`\`js
Merhaba;
Sunucumuz 5 gün içinde kurulan hesapları hiçbir şekilde kabul etmemektedir. Lütfen "Cezalıdan çıkarır mısın?" ya da "Şüpheli hesap kaldırır mısın?" yazmayın.

Eğer hesabının kurulma süresinden en az 5 gün geçtiğini düşünüyorsan ve hala buradaysan sunucudan çıkıp tekrardan girmeyi veya aşağıdaki butona tıklayarak tekrar kayıt olabilirsin, iyi günler.

Labirent\`\`\` `,
			components: [row],
		});
	},
};

client.on("interactionCreate", async (interaction) => {
	if (interaction.customId === "suphekontrol") {
		let server = await serverSettings.findOne({
			guildID: interaction.guild.id,
		});
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
		if (Date.now() - interaction.user.createdTimestamp < ms("7d")) {
			const embed = new Discord.EmbedBuilder()
				.setTitle(`Merhaba ${interaction.user.username}`)
				.setDescription(
					`
Hesabının kuruluş tarihi: **${moment(interaction.user.createdTimestamp).format(
						"LLL",
					)}** 
Hesabın: **${moment(interaction.user.createdTimestamp).fromNow()}** kurulmuş
**Hesabının kuruluş tarihi 7 günü geçmediği için seni şüpheliden çıkartamadım.** Daha sonra tekrar kontrol edebilirsin.
`,
				)
				.setColor("Red");
			interaction.reply({ embeds: [embed], ephemeral: true });
		} else {
			await interaction.member.roles.remove(server.SuspectedRole);
			await interaction.member.roles.add(server.UnregisteredRole);
			const embed = new Discord.EmbedBuilder()
				.setTitle(`Merhaba ${interaction.user.username}`)
				.setColor("Green")
				.setDescription(
					`
Hesabının kuruluş tarihi: **${moment(interaction.user.createdTimestamp).format(
						"LLL",
					)}**
Hesabın: **${moment(interaction.user.createdTimestamp).fromNow()}** kurulmuş
**Hesabının kuruluş tarihi 5 günü geçtiği için seni şüpheliden çıkarttım.** Teyit kanallarımıza girip kayıt olabilirsin.
					`,
				);
			interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
});
