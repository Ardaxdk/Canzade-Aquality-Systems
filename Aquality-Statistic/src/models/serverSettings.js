let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let serverSettings = Schema({
	// BOT

	BotOwner: {
		type: Array,
		default: [],
	},

	RegisterSystem: {
		type: Boolean,
		default: true,
	},

	TaggedMode: {
		type: Boolean,
	},

	AUTO_ROLE: {
		type: Boolean,
		default: true,
	},

	// GUILD

	guildID: {
		type: String,
		default: "",
	},

	GuildOwner: {
		type: Array,
		default: [],
	},

	Tag: {
		type: String,
		default: "",
	},

	SecondaryTag: {
		type: String,
		default: "",
	},

	Link: {
		type: String,
		default: "",
	},

	BotVoiceChannel: {
		type: String,
		default: "",
	},

	// PERMISSION

	RegisterAuth: {
		type: Array,
		default: [],
	},

	SeniorOfficial: {
		type: Array,
		default: [],
	},

	OwnerRole: {
		type: Array,
		default: [],
	},

	BotCommandRole: {
		type: Array,
		default: [],
	},

	BanAuth: {
		type: Array,
		default: [],
	},

	JailAuth: {
		type: Array,
		default: [],
	},

	ChatMuteAuth: {
		type: Array,
		default: [],
	},

	VoiceMuteAuth: {
		type: Array,
		default: [],
	},

	SolvingAuth: {
		type: Array,
		default: [],
	},

	RoleManageAuth: {
		type: Array,
		default: [],
	},

	MoveAuth: {
		type: Array,
		default: [],
	},

	ResbonsibilityRole: {
		type: Array,
		default: [],
	},

	BeginningRole: {
		type: Array,
		default: [],
	},
	// ROLE

	ManRole: {
		type: Array,
		default: [],
	},

	WomanRole: {
		type: Array,
		default: [],
	},

	UnregisteredRole: {
		type: Array,
		default: [],
	},

	FamilyRole: {
		type: Array,
		default: [],
	},

	SuspectedRole: {
		type: Array,
		default: [],
	},

	BoosterRole: {
		type: Array,
		default: [],
	},

	VipRole: {
		type: Array,
		default: [],
	},

	QuarantineRole: {
		type: Array,
		default: [],
	},

	ChatMuteRole: {
		type: Array,
		default: [],
	},

	WarnRoleOne: {
		type: Array,
		default: [],
	},

	WarnRoleTwo: {
		type: Array,
		default: [],
	},

	WarnRoleThree: {
		type: Array,
		default: [],
	},

	BannedTagRole: {
		type: Array,
		default: [],
	},

	JoinMeetingRole: {
		type: Array,
		default: [],
	},

	StreamPunitiveRole: {
		type: Array,
		default: [],
	},

	// CHANNEL

	GeneralChat: {
		type: String,
		default: "",
	},

	RegisterChat: {
		type: String,
		default: "",
	},

	RegisterParent: {
		type: String,
		default: "",
	},

	PublicParent: {
		type: String,
		default: "",
	},

	SecretParent: {
		type: String,
		default: "",
	},

	SolvingChat: {
		type: String,
		default: "",
	},

	SolvingParent: {
		type: String,
		default: "",
	},

	MeetingChannel: {
		type: String,
		default: "",
	},

	StreamParent: {
		type: String,
		default: "",
	},

	AFKRoom: {
		type: String,
		default: "",
	},

	//#region Stat

	/**STAT */
	LeaderboardChannel: {
		type: String,
		default: "",
	},
	RewardChannel: {
		type: String,
		default: "",
	},

	//#endregion Stat

	//#region Invite

	InviteLog: {
		type: String,
		default: "",
	},
	RulesChannel: {
		type: String,
		default: "",
	},
	//#endregion Invite

	// LOG

	BanLog: {
		type: String,
		default: "",
	},

	JailLog: {
		type: String,
		default: "",
	},

	ChatMuteLog: {
		type: String,
		default: "",
	},

	VoiceMuteLog: {
		type: String,
		default: "",
	},

	PenaltyPointLog: {
		type: String,
		default: "",
	},
});

module.exports = mongoose.model("kurulum", serverSettings);
