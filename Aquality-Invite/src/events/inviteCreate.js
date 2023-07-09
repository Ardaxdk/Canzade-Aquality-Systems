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
			`${client.users.cache.get(invite.inviter.id).username} tarafından ${
				inv.code
			} daveti oluşturuldu, davet sisteme tanımlandı!`,
			"log",
		);
	});
};
module.exports.conf = {
	name: "inviteCreate",
};
