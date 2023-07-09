const Discord = require("discord.js");
let serverSettings = require("../models/serverSettings");
const moment = require("moment");
moment.locale("tr");

module.exports = async (client) => {
	async function checkReward(member, voiceModel) {
		let server = await serverSettings.findOne({});
		const voiceRewards = client.settings.VOICE_REWARDS.filter(
			(reward) =>
				member.guild.roles.cache.has(reward.role) &&
				reward.rank <= voiceModel.voice &&
				!member.roles.cache.has(reward.role),
		).map((reward) => reward.role);
		const textRewards = client.settings.TEXT_REWARDS.filter(
			(reward) =>
				member.guild.roles.cache.has(reward.role) &&
				reward.rank <= voiceModel.messages &&
				!member.roles.cache.has(reward.role),
		).map((reward) => reward.role);
		const channel = member.guild.channels.cache.get(server.RewardChannel);
		if (voiceRewards.length > 0) {
			await member.roles.add(voiceRewards);
			if (channel)
				await channel.send(
					`🎉 ${member.toString()} tebrikler! Ses istatistiklerin bir sonraki seviyeye atlaman için yeterli oldu. **"${voiceRewards
						.map((id) => member.guild.roles.cache.get(id)?.name)
						.join(", ")}"** rolüne terfi edildin!`,
				);
		}
		if (textRewards.length > 0) {
			await member.roles.add(textRewards);
			if (channel)
				await channel.send(
					`🎉 ${member.toString()} tebrikler! Mesaj istatistiklerin bir sonraki seviyeye atlaman için yeterli oldu. **"${textRewards
						.map((id) => member.guild.roles.cache.get(id)?.name)
						.join(", ")}"** rolüne terfi edildin!`,
				);
		}
	}

	client.checkReward = checkReward;

	function progressBar(value, maxValue, size) {
		const progress = Math.round(
			size * (value / maxValue > 1 ? 1 : value / maxValue),
		);
		const emptyProgress = size - progress > 0 ? size - progress : 0;

		const progressText = client.settings.emojis.fill.repeat(progress);
		const emptyProgressText =
			client.settings.emojis.empty.repeat(emptyProgress);

		return emptyProgress > 0
			? progress === 0
				? client.settings.emojis.emptyStart +
				  progressText +
				  emptyProgressText +
				  client.settings.emojis.emptyEnd
				: client.settings.emojis.fillStart +
				  progressText +
				  emptyProgressText +
				  client.settings.emojis.emptyEnd
			: client.settings.emojis.fillStart +
					progressText +
					emptyProgressText +
					client.settings.emojis.fillEnd;
	}
	client.progressBar = progressBar;

	async function taskAdd(interaction, type, hedef, puan, text) {
		const Task = require("../models/task");
		return await new Task({
			userID: interaction.member.id,
			situation: true,
			completed: false,
			level: 0,
			target: hedef,
			point: puan,
			type: type,
			tasknumber: interaction.values[0],
			description: text,
			date: Date.now(),
			end: moment.duration(moment().endOf("day").valueOf()),
		}).save();
	}

	client.taskAdd = taskAdd;

	async function taskUpdate(type, count, member) {
		const task = require("../models/task");
		const points = require("../models/points");

		const Task = await task.find({
			userID: member.id,
			type: type,
			situation: true,
		});
		const aktifTamam = await task.find({
			userID: member.id,
			situation: true,
			completed: true,
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
				if (aktifTamam.length + 1 >= 5)
					await points.findOneAndUpdate(
						{ guildID: member.guild.id, userID: member.id },
						{ $inc: { points: Number(1000) } },
						{ upsert: true },
					);
				if (
					client.channels.cache.find(
						(x) => x.name === "görev-dağıtım",
					)
				)
					client.channels.cache
						.find((x) => x.name === "görev-dağıtım")
						.send(
							`Tebrikler, ${member.toString()} **${
								type.charAt(0).toLocaleUpperCase() +
								type.slice(1)
							}** isimli görevini tamamlayarak ${Number(
								task.point,
							)} puan kazandın.`,
						);
			}
			await task.save();
		});
	}

	client.taskUpdate = taskUpdate;

	function ms(milliseconds) {
		const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

		return {
			days: roundTowardsZero(milliseconds / 86400000),
			hours: roundTowardsZero(milliseconds / 3600000) % 24,
			minutes: roundTowardsZero(milliseconds / 60000) % 60,
			seconds: roundTowardsZero(milliseconds / 1000) % 60,
			milliseconds: roundTowardsZero(milliseconds) % 1000,
			microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
			nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000,
		};
	}

	client.ms = ms;

	function send(mesaj, msg, kanal) {
		if (!mesaj || typeof mesaj !== "string") return;
		const embd = new Discord.EmbedBuilder()
			.setAuthor({
				name: msg.username,
				iconURL: msg.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Aqua")
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

	function shuffle(array) {
		var currentIndex = array.length,
			temporaryValue,
			randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}
	client.shuffle = shuffle;
};
