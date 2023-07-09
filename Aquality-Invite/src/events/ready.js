const { joinVoiceChannel } = require("@discordjs/voice");
const { ActivityType, Collection } = require("discord.js");

module.exports = async () => {
	require("../modules/function")(client);
	let guild = client.guilds.cache.get(client.settings.GUILD_ID);
	await guild.members.fetch().then((e) => console.log("Üyeler fetchlendi."));

	const VoiceChannel = client.channels.cache.get(
		client.settings.BOT_VOICE_CHANNEL,
	);
	joinVoiceChannel({
		channelId: VoiceChannel.id,
		guildId: VoiceChannel.guild.id,
		adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
		selfDeaf: true,
	});
	guild.invites.fetch().then((guildInvites) => {
		const cacheInvites = new Collection();
		guildInvites.map((inv) => {
			cacheInvites.set(inv.code, {
				code: inv.code,
				uses: inv.uses,
				inviter: inv.inviter,
			});
		});
		client.invites.set(guild.id, cacheInvites);
		client.logger.log(`sunucu inviteları sisteme tanımlandı.`, "ready");
	});
	setInterval(() => {
		const can = Math.floor(
			Math.random() * client.settings.BOT_STATUS.length,
		);
		client.user.setPresence({
			activities: [
				{
					name: client.settings.BOT_STATUS[can],
					type: ActivityType.Watching,
				},
			],
			status: "dnd",
		});
	}, 10000);
	client.logger.log(
		`${client.user.username}, kullanıma hazır ${client.users.cache.size} kullanıcı, ${client.guilds.cache.size} sunucu.`,
		"ready",
	);
};

module.exports.conf = {
	name: "ready",
};
