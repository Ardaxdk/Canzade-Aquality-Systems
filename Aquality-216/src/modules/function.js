const Discord = require("discord.js");

module.exports = async (client) => {
	client.taskUpdate = async (type, count, member) => {
		const task = require("../models/task");
		const points = require("../models/points");

		const Task = await task.find({
			userID: member.id,
			type: type,
			situation: true,
		});

		Task.forEach(async (task) => {
			task.level += Number(count);
			if (task.completed == false && task.level >= task.target) {
				task.completed = true;

				await points.findOneAndUpdate(
					{ guildID: member.guild.id, userID: member.id },
					{ $inc: { points: Number(task.point) } },
					{ upsert: true },
				);
			}
			await task.save();
		});
	};
	function send(mesaj, msg, kanal) {
		if (!mesaj || typeof mesaj !== "string") return;
		const embd = new Discord.EmbedBuilder()
			.setAuthor({
				name: msg.username,
				iconURL: msg.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Random")
			.setDescription(mesaj);
		kanal
			.send({ embeds: [embd] })
			.then((msg) => {
				{
					setTimeout(() => {
						msg.delete();
					}, 15000);
				}
			})
			.catch();
	}
	client.send = send;
};
