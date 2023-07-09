const Discord = require("discord.js");
const Cooldowns = new Discord.Collection();
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "sorunçözücüçağır",
		usage: "soruncozucucagır",
		category: "BotOwner",
		description: "Sorun çözücü çağır mesajını atmaya yarar.",
		aliases: ["soruncozucucagir"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId("soruncozucucagir")
				.setLabel("Sorun çözücü çağır")
				.setStyle(Discord.ButtonStyle.Danger),
		);

		message.channel.send({ content: " ㅤ", components: [row] });
	},
};

client.on("interactionCreate", async (interaction) => {
	if (interaction.customId === "soruncozucucagir") {
		let server = await serverSettings.findOne({
			guildID: interaction.guild.id,
		});
		if (!interaction.member.voice.channel)
			return interaction.reply({
				content:
					"Sorun çözücü çağırmak için sorun çözme kanallarından birisinde olmalısın",
				ephemeral: true,
			});
		if (interaction.member.voice.channel.parentId !== server.SolvingParent)
			return interaction.reply({
				content:
					"Sorun çözücü çağırmak için sorun çözme kanallarından birisinde olmalısın",
				ephemeral: true,
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
		let üyeler = [
			...interaction.guild.members.cache
				.filter(
					(uye) =>
						!uye.user.bot &&
						server.SolvingAuth.some((x) =>
							uye.roles.cache.has(x),
						) &&
						uye.presence &&
						uye.presence.status !== "offline",
				)
				.values(),
		];
		if (üyeler.length == 0)
			return interaction.reply({
				content: "Üzgünüm şuan aktif olan sorun çözücü bulunmamakta.",
				ephemeral: true,
			});

		interaction.reply({
			content: `Sorun çözme yetkililerini <#${server.SolvingChat}> kanalına etiketledim.`,
			ephemeral: true,
		});
		client.channels.cache.get(server.SolvingChat).send({
			content: `
${interaction.member} => ${
				interaction.member.voice.channel
			} Kanalında sorun çözücü çağırdı.
${üyeler.map((x) => "<@" + x.id + ">").join(",")}
				`,
		});
	}
});
