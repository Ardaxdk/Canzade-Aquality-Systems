const inviterSchema = require("../models/inviter");
const inviteSchema = require("../models/inviteMember");
let serverSettings = require("../models/serverSettings");
module.exports = async (member) => {
	if (member.user.bot) return;
	let server = await serverSettings.findOne({});

	const LogChannel = client.channels.cache.get(server.InviteLog);

	const invite = await inviteSchema.findOne({
		guildID: member.guild.id,
		userID: member.user.id,
	});

	if (!invite) {
		LogChannel.send(
			`\`${member.user.username}\` sunucumuzdan ayrıldı kimin davet ettiğini bulamadım.`,
		);
	} else {
		const inviter = await client.users.fetch(invite.inviter);
		await inviterSchema.findOneAndUpdate(
			{ guildID: member.guild.id, userID: inviter.id },
			{ $inc: { leave: 1, total: -1 } },
			{ upsert: true },
		);
		const inviterMember = await inviterSchema.findOne({
			guildID: member.guild.id,
			userID: inviter.id,
		});
		const total = inviterMember ? inviterMember.total : 0;
		LogChannel.send(
			`\`${member.user.username}\` sunucumuzdan ayrıldı. ${inviter.username} tarafından davet edilmişti. (**${total}** davet)`,
		);
	}
};
module.exports.conf = {
	name: "guildMemberRemove",
};
