const Discord = require("discord.js");
const VoiceModel = require("../models/voiceModel");
const ChannelModel = require("../models/channelModel");

module.exports = async (oldState, newState) => {
	if (
		!oldState.member ||
		!newState.member ||
		oldState.member.guild.id != client.settings.GUILD_ID ||
		oldState.member.user.bot ||
		newState.member.user.bot
	)
		return;
	let voiceModel = await VoiceModel.findOne({
		userID: newState.member.user.id,
		guildID: newState.guild.id,
	});
	let updated = false;
	if (!voiceModel) {
		voiceModel = new VoiceModel({
			userID: newState.member.user.id,
			guildID: newState.guild.id,
		});
		updated = true;
	}

	/* Kanala katılırsa */
	if (!oldState.channelId && newState.channelId) {
		if (!newState.selfDeaf && !newState.selfMute) {
			client.ChannelJoined.set(newState.member.id, Date.now());
		}
	}

	/* kanaldan ayrılırsa */
	if (oldState.channel && !newState.channelId) {
		const time = client.ChannelJoined.get(oldState.member.id);
		if (time) {
			const diffrence = Date.now() - time;
			voiceModel.voice += diffrence;
			client.ChannelJoined.delete(oldState.member.id);
			updated = true;
			await client.taskUpdate("Ses", diffrence, oldState.member);
			await client.checkReward(oldState.member, voiceModel);
			let channelModel = await ChannelModel.findOne({
				channelID: oldState.channel.id,
				guildID: oldState.guild.id,
				userID: oldState.member.id,
			});
			if (!channelModel)
				channelModel = new ChannelModel({
					channelID: oldState.channel.id,
					guildID: oldState.guild.id,
					userID: oldState.member.id,
				});
			channelModel.type = "GUILD_VOICE";
			channelModel.data += diffrence;
			await channelModel.save();
		}
	}

	if (newState.streaming && !oldState.streaming) {
		client.Stream.set(newState.member.id, Date.now());
	}
	if (!newState.streaming && oldState.streaming) {
		const time = client.Stream.get(oldState.member.id);
		if (time) {
			const diffrence = Date.now() - time;
			voiceModel.streaming += diffrence;
			client.Stream.delete(oldState.member.id);
			updated = true;
		}
	}

	if (newState.selfVideo && !oldState.selfVideo) {
		client.Camera.set(newState.member.id, Date.now());
	}
	if (!newState.selfVideo && oldState.selfVideo) {
		const time = client.Camera.get(oldState.member.id);
		if (time) {
			const diffrence = Date.now() - time;
			voiceModel.cam += diffrence;
			client.Stream.delete(oldState.member.id);
			updated = true;
		}
	}

	/*	if(newState.streaming && !oldState.streaming){
		const time = client.Stream.get(newState.member.id);
		if (time) {
			const diffrence = Date.now() - time;
			voiceModel.streaming += diffrence;
			client.Stream.set(newState.member.id, Date.now());
			updated = true;
		}
	}
	if(!newState.streaming && oldState.streaming){
		const time = client.Stream.get(oldState.member.id);
		if (time) {
			const diffrence = Date.now() - time;
			voiceModel.streaming += diffrence;
			client.Stream.set(oldState.member.id, Date.now());
			updated = true;
		}
	}*/

	/* kanal değişirse */
	if (oldState.channel && newState.channelId) {
		const time = client.ChannelJoined.get(oldState.member.id);
		if (time) {
			const diffrence = Date.now() - time;
			voiceModel.voice += diffrence;
			client.ChannelJoined.set(newState.member.id, Date.now());
			updated = true;
			await client.taskUpdate("Ses", diffrence, oldState.member);
			await client.checkReward(oldState.member, voiceModel);
			let channelModel = await ChannelModel.findOne({
				channelID: oldState.channel.id,
				guildID: oldState.guild.id,
				userID: oldState.member.id,
			});
			if (!channelModel)
				channelModel = new ChannelModel({
					channelID: oldState.channel.id,
					guildID: oldState.guild.id,
					userID: oldState.member.id,
				});
			channelModel.type = "GUILD_VOICE";
			channelModel.data += diffrence;
			await channelModel.save();
		}
	}

	/* Kulaklık - mic kaparsa */
	if (newState.channelId && (newState.selfDeaf || newState.selfMute)) {
		const time = client.ChannelJoined.get(newState.member.id);
		if (time) {
			const diffrence = Date.now() - time;
			voiceModel.voice += diffrence;
			client.ChannelJoined.delete(oldState.member.id);
			updated = true;
			await client.taskUpdate("Ses", diffrence, oldState.member);
			await client.checkReward(oldState.member, voiceModel);
			let channelModel = await ChannelModel.findOne({
				channelID: newState.channel.id,
				guildID: newState.guild.id,
				userID: newState.member.id,
			});
			if (!channelModel)
				channelModel = new ChannelModel({
					channelID: newState.channel.id,
					guildID: newState.guild.id,
					userID: newState.member.id,
				});
			channelModel.type = "GUILD_VOICE";
			channelModel.data += diffrence;
			await channelModel.save();
		}
	}

	/* Kulaklık - mic açarsa */
	if (
		(oldState.selfDeaf || oldState.selfMute) &&
		!newState.selfDeaf &&
		!newState.selfMute
	) {
		client.ChannelJoined.set(newState.member.id, Date.now());
	}

	if (updated) await voiceModel.save();
};

module.exports.conf = {
	name: "voiceStateUpdate",
};
