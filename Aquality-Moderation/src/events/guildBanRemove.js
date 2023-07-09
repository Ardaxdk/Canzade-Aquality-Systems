const unBan = require("../models/cantUnBan.js");

module.exports = async (ban) => {
	unBan.findOne({ userID: ban.user.id }, async (err, e) => {
		if (!e) return;
		ban.guild.fetchAuditLogs({ type: 23 }).then(async (audit) => {
			let ayar = audit.entries.first();
			let yapan = ayar.executor;
			if (yapan.id == e.mod) {
				e.delete().catch((a) => console.log(a));
				return;
			} else {
				ban.guild.members.ban(ban.user.id, { reason: e.sebep });
			}
		});
	});
};

module.exports.conf = {
	name: "guildBanRemove",
};
