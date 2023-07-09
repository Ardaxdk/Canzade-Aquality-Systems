const { Collection } = require("discord.js");
const inviterSchema = require("../models/inviter");
const inviteMemberSchema = require("../models/inviteMember");
let serverSettings = require("../models/serverSettings");
const moment = require("moment");
moment.locale("tr");

module.exports = async (member) => {
	if (member.user.bot) return;
	let server = await serverSettings.findOne({});

	const guildInvites =
		client.invites.get(member.guild.id) || new Collection();
	const invites = await member.guild.invites.fetch();
	const invite =
		invites.find(
			(inv) =>
				guildInvites.has(inv.code) &&
				inv.uses > guildInvites.get(inv.code).uses,
		) ||
		guildInvites.find((x) => !invites.has(x.code)) ||
		member.guild.vanityURLCode;
	const cacheInvites = new Collection();
	invites.map((inv) => {
		cacheInvites.set(inv.code, {
			code: inv.code,
			uses: inv.uses,
			inviter: inv.inviter,
		});
	});
	client.invites.set(member.guild.id, cacheInvites);
	let isMemberFake =
		Date.now() - member.user.createdTimestamp < 7 * 24 * 60 * 60 * 1000;

	const WelcomeChannel = client.channels.cache.get(server.RegisterChat);
	const LogChannel = client.channels.cache.get(server.InviteLog);
	const RulesChannel = client.channels.cache.get(server.RulesChannel);

	if (!invite) {
		WelcomeChannel.send(
			`
${member.guild.name} hoş geldin, ${member}!
Seninle beraber **${member.guild.memberCount}** üyeye ulaşmış bulunmaktayız. 🎉

Sunucuya erişebilmek için **"V.Confirmed"** odalarında kayıt olup ismini ve yaşını belirtmen gerekmektedir.
${RulesChannel} kanalından sunucu kurallarımızı okumayı ihmal etme!

Hesabın ${moment(member.user.createdTimestamp).format(
				"LLL",
			)} tarihinde oluşturulmuş. ${isMemberFake ? `🚫` : ``}`,
		);
		LogChannel.send(
			`${member} üyesi **sunucumuza katıldı!** ${
				isMemberFake ? `🚫` : ``
			}`,
		);
	} else if (invite === member.guild.vanityURLCode) {
		WelcomeChannel.send(
			`
${member.guild.name} hoş geldin, ${member}!
Seninle beraber **${member.guild.memberCount}** üyeye ulaşmış bulunmaktayız. 🎉

Sunucuya erişebilmek için **"V.Confirmed"** odalarında kayıt olup ismini ve yaşını belirtmen gerekmektedir.
${RulesChannel} kanalından sunucu kurallarımızı okumayı ihmal etme!

Hesabın ${moment(member.user.createdTimestamp).format(
				"LLL",
			)} tarihinde oluşturulmuş. ${isMemberFake ? `🚫` : ``}`,
		);
		LogChannel.send(
			`${member} üyesi **sunucumuza ÖZEL URL kullanarak katıldı!** ${
				isMemberFake ? `🚫` : ``
			}`,
		);
	} else {
		if (isMemberFake) {
			await inviteMemberSchema.findOneAndUpdate(
				{ guildID: member.guild.id, userID: member.user.id },
				{ $set: { inviter: invite.inviter.id, date: Date.now() } },
				{ upsert: true },
			);
			await inviterSchema.findOneAndUpdate(
				{ guildID: member.guild.id, userID: invite.inviter.id },
				{ $inc: { total: 1, fake: 1 } },
				{ upsert: true },
			);
			const inviterData = await inviterSchema.findOne({
				guildID: member.guild.id,
				userID: invite.inviter.id,
			});
			const total = inviterData ? inviterData.total : 0;
			WelcomeChannel.send(
				`
${member.guild.name} hoş geldin, ${member}!
Seninle beraber **${member.guild.memberCount}** üyeye ulaşmış bulunmaktayız. 🎉

Sunucuya erişebilmek için **"V.Confirmed"** odalarında kayıt olup ismini ve yaşını belirtmen gerekmektedir.
${RulesChannel} kanalından sunucu kurallarımızı okumayı ihmal etme!

Hesabın ${moment(member.user.createdTimestamp).format(
					"LLL",
				)} tarihinde oluşturulmuş. 🚫 ${
					invite.inviter
				} tarafından davet edildin ve bu kişinin ${total} daveti oldu!`,
			);
			LogChannel.send(
				`${member} 🚫 üyesi sunucumuza **${invite.inviter.username}** tarafından davet edildi, ve bu kişinin ${total} daveti oldu.`,
			);
		} else {
			await inviteMemberSchema.findOneAndUpdate(
				{ guildID: member.guild.id, userID: member.user.id },
				{ $set: { inviter: invite.inviter.id, date: Date.now() } },
				{ upsert: true },
			);
			await inviterSchema.findOneAndUpdate(
				{ guildID: member.guild.id, userID: invite.inviter.id },
				{ $inc: { total: 1, regular: 1 } },
				{ upsert: true },
			);
			await client.taskUpdate("Davet", 1, invite.inviter);

			const inviterData = await inviterSchema.findOne({
				guildID: member.guild.id,
				userID: invite.inviter.id,
			});
			const total = inviterData ? inviterData.total : 0;
			WelcomeChannel.send(
				`
${member.guild.name} hoş geldin, ${member}!
Seninle beraber **${member.guild.memberCount}** üyeye ulaşmış bulunmaktayız. 🎉

Sunucuya erişebilmek için **"V.Confirmed"** odalarında kayıt olup ismini ve yaşını belirtmen gerekmektedir.
${RulesChannel} kanalından sunucu kurallarımızı okumayı ihmal etme!

Hesabın ${moment(member.user.createdTimestamp).format(
					"LLL",
				)} tarihinde oluşturulmuş. ${
					invite.inviter
				} tarafından davet edildin ve bu kişinin ${total} daveti oldu!`,
			);
			LogChannel.send(
				`${member} üyesi sunucumuza **${invite.inviter.username}** tarafından davet edildi, ve bu kişinin ${total} daveti oldu.`,
			);
		}
	}
};
module.exports.conf = {
	name: "guildMemberAdd",
};
