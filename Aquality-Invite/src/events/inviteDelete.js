module.exports = async (invite) => {
	invite.guild.invites.fetch().then((guildInvites) => {
		const cacheInvites = new Collection();
		guildInvites.map((inv) => {
			cacheInvites.set(inv.code, {
				code: inv.code,
				uses: inv.uses,
				inviter: inv.inviter,
			});
		});
		client.invites.set(invite.guild.id, cacheInvites);
		client.logger.log(
			`${invite.code} daveti silindi, davet sistemden kaldırıldı!`,
			"log",
		);
	});
};
module.exports.conf = {
	name: "inviteDelete",
};
