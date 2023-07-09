const CONFIG = {
	BOT_TOKEN:
		"",
	MONGO_URL:
		"",
	PREFIX: ["!", "."],
	BOT_VOICE_CHANNEL: "1013200755211124819",
	BOT_STATUS: ["canzade ❤️ Labirent", "Labirent ❤️ canzade"],
	GUILD_ID: "1013200754523258910",
	LEADERBOARD_VOICE: "3243242",
	LEADERBOARD_TEXT: "324234234",

	PARENTS: [
		{
			name: "Public",
			id: "1013200757710934039",
		},
		{
			name: "Kayıt",
			id: "1013200754770706456",
		},
		{
			name: "Sorun Çözme",
			id: "1013200757245345818",
		},
		{
			name: "Stream",
			id: "1013200757463462003",
		},
		{
			name: "Toplantı",
			id: "1013200756221943859",
		},
		{
			name: "VK",
			id: "1013200758319095948",
		},
		/*{
			name: "Etkinlik",
			id: "1013200754770706456",
		},
		{
			name: "Konser",
			id: "1013200754770706456",
		},*/
		{
			name: "Secret",
			id: "1013200758134554724",
		},
	],

	CHANNELSTAT: [
		{
			name: "Sleep Room",
			id: "1013200757924827191",
		},
	],

	VOICE_REWARDS: [
		{
			rank: 1000 * 60 * 60 * 24 * 4,
			role: "1013200754657472546",
		},
		{
			rank: 1000 * 60 * 60 * 24 * 12,
			role: "1013200754657472547",
		},
		{
			rank: 1000 * 60 * 60 * 24 * 33,
			role: "1013200754657472548",
		},
		{
			rank: 1000 * 60 * 60 * 24 * 83,
			role: "1013200754657472549",
		},
	],
	TEXT_REWARDS: [
		{
			rank: 1000,
			role: "1013200754640687204",
		},

		{
			rank: 5000,
			role: "1013200754657472542",
		},
		{
			rank: 50000,
			role: "1013200754657472543",
		},
		{
			rank: 100000,
			role: "1013200754657472544",
		},
	],

	emojis: {
		yes_name: "yes_zade",
		no_name: "no_zade",
		fillStart: "<:ilkdolu:1118109909427421224>",
		fill: "<:ortadolu:1118109888342663248>",
		fillEnd: "<:sondolu:1118109881086529536>",
		emptyStart: "<:ilkbos:1118109913332334693>",
		empty: "<:ortabos:1118109891521937488>",
		emptyEnd: "<:sonbos:1118109884316127282>",
		Coin: "zade_altin",
		CoinFlip: "zade_altinn",
		Money: "zade_para",
		ZadeSlot: "zade_slotgif",
		Kalp: "zade_kalp",
		Patlıcan: "zade_patlican",
		Kiraz: "zade_kiraz",
	},
};

module.exports = CONFIG;
