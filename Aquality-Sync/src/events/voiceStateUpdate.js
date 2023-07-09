const kanallar = require("../models/seslog");

module.exports = async (oldState, newState) => {
	if (
		!oldState.member ||
		!newState.member ||
		oldState.member.guild.id != client.settings.GUILD_ID ||
		oldState.member.user.bot ||
		newState.member.user.bot
	)
		return;
	const logKanal = client.channels.cache.find(
		(channel) => channel.name === "ses-log",
	);

	if (!oldState.channel && newState.channel) {
		logKanal.send(
			`\`${oldState.member.user.username}\` kullanıcısı \`${newState.channel.name}\` kanalına giriş yaptı.`,
		);
		kanallar.findOne(
			{
				user: oldState.member.id,
			},
			async (err, res) => {
				if (!res) {
					let arr = [];
					arr.push({
						kanal: newState.channel.id,
						tarih: Date.parse(new Date()),
						state: "Giriş",
					});
					let newData = new kanallar({
						user: oldState.member.id,
						kanallar: arr,
					});
					await newData.save().catch((e) => console.log(e));
				} else {
					res.kanallar.push({
						kanal: newState.channel.id,
						tarih: Date.parse(new Date()),
						state: "Giriş",
					});
					await res.save().catch((e) => console.log(e));
				}
			},
		);
	} else if (oldState.channel && !newState.channel) {
		logKanal.send(
			`\`${oldState.member.user.username}\` kullanıcısı \`${oldState.channel.name}\` kanalından çıkış yaptı.`,
		);
	} else if (
		oldState.channel &&
		newState.channel &&
		oldState.channel.id !== newState.channel.id
	) {
		logKanal.send(
			`\`${oldState.member.user.username}\` kullanıcısı \`${oldState.channel.name}\` => \`${newState.channel.name} \` geçiş yaptı.`,
		);
		kanallar.findOne(
			{
				user: oldState.member.id,
			},
			async (err, res) => {
				if (!res) {
					let arr = [];
					arr.push({
						kanal: oldState.channel.id,
						tarih: Date.parse(new Date()),
						state: "Değiştirme",
					});
					let newData = new kanallar({
						user: oldState.member.id,
						kanallar: arr,
					});
					await newData.save().catch((e) => console.log(e));
				} else {
					res.kanallar.push({
						kanal: oldState.channel.id,
						yenikanal: newState.channel.id,
						tarih: Date.parse(new Date()),
						state: "Değiştirme",
					});
					await res.save().catch((e) => console.log(e));
				}
			},
		);
	}

	if (!oldState.selfMute && newState.selfMute) {
		logKanal.send(
			`\`${oldState.member.user.username}\` kullanıcısı \`${newState.channel.name}\` kanalında kendini susturdu.`,
		);
	} else if (oldState.selfMute && !newState.selfMute) {
		logKanal.send(
			`${oldState.member.user.username} kullanıcısı \`${newState.channel.name}\` kanalında kendi susturmasını kaldırdı.`,
		);
	}
};

module.exports.conf = {
	name: "voiceStateUpdate",
};
