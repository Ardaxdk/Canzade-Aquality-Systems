let serverSettings = require("../models/serverSettings");
const data = require("../models/yasaklıtag.js");
const sunucu = require("../models/sunucu-bilgi.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const { ActivityType } = require("discord.js");

module.exports = async () => {
	require("../modules/function")(client);
	require("../modules/otoCeza")(client);
	require("../modules/privateChannel.js")(client);
	require("../modules/unjail.js")(client);
	require("../modules/unmutes.js")(client);
	require("../modules/vunmutes.js")(client);
	require("../modules/zamanlayıcı.js")(client);

	let guild = client.guilds.cache.get(client.settings.GUILD_ID);
	await guild.members.fetch().then((e) => console.log("Üyeler fetchlendi."));

	await serverSettings.findOne({}, async (err, doc) => {
		if (!doc) {
			new serverSettings({
				guildID: client.settings.GUILD_ID,
			}).save();
		}
	});

	const VoiceChannel = client.channels.cache.get(
		client.settings.BOT_VOICE_CHANNEL,
	);
	joinVoiceChannel({
		channelId: VoiceChannel.id,
		guildId: VoiceChannel.guild.id,
		adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
		selfDeaf: true,
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

	client.logger.log(`${client.lastPunishment} ceza tanımlandı!`, "ready");
};

module.exports.conf = {
	name: "ready",
};
