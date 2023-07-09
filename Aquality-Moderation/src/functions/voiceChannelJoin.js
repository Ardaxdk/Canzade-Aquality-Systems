let serverSettings = require("../models/serverSettings");

module.exports = async (member, channel) => {
	let server = await serverSettings.findOne({});

	let streamcategory = client.guild.channels.cache.get(server.StreamCategory);
	if (!streamcategory.includes(channel.id)) return;
	if (!member.displayName.includes("|")) return;
	let memberAge = member.displayName.split("|")[1];
	if (isNaN(memberAge)) return;
	if (memberAge < 18) {
		let warningCount = client.streamWarning.get(member.id) || 1;
		client.streamWarning.set(member.id, warningCount + 1);
		client.channels.cache
			.find((channel) => channel.name === "stream-cezalı")
			.send({
				content: `
${member} üyesi 18 yaşından küçük olmasına rağmen \`${channel.name}\` +18 kanalına giriş yaptı ve sesten attım.`,
			});
		if (member.voice.channel) {
			setTimeout(() => {
				member.voice.disconnect();
			}, 5000);
		}
		if (warningCount >= 3) {
			member.roles.add(server.StreamPunitiveRole);
			if (member.voice.channel) {
				setTimeout(() => {
					member.voice.disconnect();
				}, 5000);
			}
			client.channels.cache
				.find((channel) => channel.name === "stream-cezalı")
				.send({
					content: `
${member} üyesi 18 yaşından küçük olmasına rağmen \`${channel.name}\` +18 kanalına 3. giriş yapmayı denedi. Kanaldan atıp, \`Streamer Cezalı\` rolü verdim.`,
				});
		}
		setTimeout(() => {
			if (client.streamWarning.has(member.id)) {
				client.streamWarning.delete(member.id);
			}
		}, 60000);
	}
};
