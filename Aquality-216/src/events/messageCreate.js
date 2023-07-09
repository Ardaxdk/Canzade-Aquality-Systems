const ms = require("ms");
let serverSettings = require("../models/serverSettings");
module.exports = async (message) => {
	if (message.author.bot && message.author.id !== client.user.id) return;
	let server = await serverSettings.findOne({});

	let prefix = client.settings.PREFIX;
	let canım = false;
	for (const içindeki of prefix) {
		if (message.content.startsWith(içindeki)) canım = içindeki;
	}

	if (!canım) return;

	const args = message.content.slice(canım.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (message.guild && !message.member)
		await message.guild.fetchMember(message.author);

	const cmd =
		client.commands.get(command) ||
		client.commands.get(client.aliases.get(command));

	if (!cmd) return;
	if (cmd && !message.guild && cmd.conf.guildOnly) return;

	message.flags = [];
	while (args[0] && args[0][0] === "-") {
		message.flags.push(args.shift().slice(1));
	}

	if (client.blockedFromCommand.includes(message.author.id)) return;
	if (
		!server?.BotOwner.includes(message.author.id) &&
		!server?.GuildOwner.includes(message.author.id)
	) {
		let blockArr = client.commandBlock.get(message.author.id) || [];

		let datax = {
			içerik: message.content,
			kanal: message.channel.name,
			komut: cmd.conf.name,
		};

		blockArr.push(datax);

		client.commandBlock.set(message.author.id, blockArr);

		let canzade = await client.users.fetch("331846231514939392");

		if (blockArr.length == 9) {
			message.channel.send(
				`${message.author}` +
					"```⛔ Komut kullanımını kötüye kullandığın için engellendi. Açtırmak için ( " +
					canzade.username +
					" ) kişisine ulaşman gerekiyor.```",
			);
			client.channels.cache
				.find((channel) => channel.name === "command-block")
				.send(
					`**${message.author.username}** - ${message.author} (\`${
						message.author.id
					}\`) komut engeli yedi. | Komut kullanım özeti:\n\`\`\`${blockArr
						.map((x) => x.içerik)
						.join("\n")}\nKullandığı komutlar: ${blockArr
						.map((x) => x.komut)
						.join(",")}\nKullandığı kanallar: ${blockArr
						.map((x) => x.kanal)
						.join(",")}\`\`\``,
				);
			client.blockedFromCommand.push(message.author.id);
		}

		setTimeout(() => {
			if (client.commandBlock.has(message.author.id)) {
				client.commandBlock.delete(message.author.id);
			}
		}, ms("1m"));
	}

	client.logger.log(
		`${message.author.username} (${message.author.id}) komut kullandı "${cmd.conf.name}" kullandığı kanal ${message.channel.name}`,
		"cmd",
	);

	cmd.run(client, message, args);
};

module.exports.conf = {
	name: "messageCreate",
};

