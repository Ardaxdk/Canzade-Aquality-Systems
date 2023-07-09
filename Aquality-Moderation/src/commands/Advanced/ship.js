const Discord = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
let serverSettings = require("../../models/serverSettings");
module.exports = {
	conf: {
		name: "ship",
		usage: "ship",
		category: "Global",
		description:
			"Boosterlar sunucu isimlerini bu komut ile değiştirebilir.",
		aliases: ["ship"],
	},

	async run(client, message, args) {
		if (
			!["ship", "commands", "command", "komut"].some((x) =>
				message.channel.name.includes(x),
			)
		)
			return;

		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		let mention =
			message.mentions.members.first() ||
			message.guild.members.cache.get(args[0]);
		if (!mention) {
			if (server.ManRole.some((x) => message.member.roles.cache.has(x))) {
				mention = message.guild.members.cache
					.filter(
						(uye) =>
							server.WomanRole.some((x) =>
								uye.roles.cache.has(x),
							) && !uye.user.bot,
					)
					.random();
			} else if (
				server.WomanRole.some((x) => message.member.roles.cache.has(x))
			) {
				mention = message.guild.members.cache
					.filter(
						(uye) =>
							server.ManRole.some((x) =>
								uye.roles.cache.has(x),
							) && !uye.user.bot,
					)
					.random();
			}
		}

		const canvas = createCanvas(700, 250);
		const context = canvas.getContext("2d");

		const heart = await loadImage(
			"https://cdn.discordapp.com/attachments/927571230134009856/975157787002826762/zadekalp.png",
		);
		const broken = await loadImage(
			"https://cdn.discordapp.com/attachments/927571230134009856/975157787678093342/zadekirikkalp.png",
		);
		const think = await loadImage(
			"https://cdn.discordapp.com/attachments/731112308134248469/949237394736037938/thnk.png",
		);

		const background = await loadImage(
			"https://cdn.discordapp.com/attachments/731112308134248469/949078364445081620/hearts.png",
		);

		const messageMember = await loadImage(
			message.author.displayAvatarURL({ extension: "png" }),
		);
		const mentionMember = await loadImage(
			mention.displayAvatarURL({ extension: "png" }),
		);

		context.drawImage(background, 0, 0, canvas.width, canvas.height);
		context.drawImage(messageMember, 55, 25, 200, 200);
		context.drawImage(mentionMember, 445, 25, 200, 200);

		const shipPercentage = Math.floor(Math.random() * 101);

		let mesaj;
		if (shipPercentage > 75 && shipPercentage < 100) {
			context.drawImage(heart, 275, 60, 150, 150);

			mesaj = `${message.member} = ${mention}\nAşk görüyorum 😍🥰 (**%${shipPercentage}**)`;
		}
		if (shipPercentage > 55 && shipPercentage < 75) {
			context.drawImage(think, 275, 60, 150, 150);
			mesaj = `${message.member} = ${mention}\nDenemekte fayda var 😉 (**%${shipPercentage}**)`;
		}
		if (shipPercentage > 0 && shipPercentage < 55) {
			context.drawImage(broken, 275, 60, 150, 150);
			mesaj = `${message.member} = ${mention}\nNextle 🤮 (**%${shipPercentage}**)`;
		}

		const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), {
			name: "ship.png",
		});

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL(),
			})
			.setDescription(`${mesaj}`)
			.setImage(`attachment://ship.png`)
			.setColor("Random");
		message.reply({
			embeds: [embed],
			files: [attachment],
		});
	},
};
