const PrivateModel = require("../models/privateroom");
module.exports = async (client) => {
	setInterval(async () => {
		const PrivateRoom = ((await PrivateModel.find({})) || [])?.filter(
			(r) =>
				!client.channels.cache.get(r.voiceChannelID) ||
				(Date.now() - (r.createDate ?? 0) > 1000 * 60 * 5 &&
					(client.channels.cache.get(r.voiceChannelID)?.members
						?.size ?? 0) == 0),
		);

		for (let CH of PrivateRoom) {
			await PrivateModel.deleteMany({
				voiceChannelID: CH.voiceChannelID,
			});
			if (
				client.channels.cache.get(CH.voiceChannelID) &&
				client.channels.cache.get(CH.voiceChannelID)?.deletable
			)
				client.channels.cache.get(CH.voiceChannelID).delete();
			if (
				client.channels.cache.get(CH.textChannelID) &&
				client.channels.cache.get(CH.textChannelID)?.deletable
			)
				client.channels.cache.get(CH.textChannelID).delete();
		}
	}, 1000 * 60);
};
