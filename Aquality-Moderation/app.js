const { Client, Collection } = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const taglar = require("./src/models/yasaklıtag.js");
const tag = [];
const client = (global.client = new Client({
	intents: [
		"GuildMembers",
		"MessageContent",
		"Guilds",
		"GuildMessages",
		"GuildMessageReactions",
		"GuildEmojisAndStickers",
		"GuildVoiceStates",
		"GuildPresences",
	],
}));
const path = require("path");
client.settings = require("./config.js");
client.lastPunishment = 0;
client.adBlock = new Map();
client.kayıtlar = new Map();
client.streamWarning = new Map();
client.channelTime = new Map();
client.snipe = new Map();
client.spam = new Map();
client.banLimit = new Map();
client.boosterLimit = new Map();
client.self = new Map([]);
client.jailLimit = new Map();
client.solvingCall = new Map();
client.roleLimit = new Map();
client.unregisterLimit = new Map();
client.capsBlock = new Map();
client.yasaklıtag = [];
client.blockedFromCommand = [];
client.commandBlock = new Map();
client.commands = new Collection();
client.aliases = new Collection();
client.databaseCache = {};
client.databaseCache.users = new Collection();
client.databaseCache.guilds = new Collection();
client.databaseCache.members = new Collection();
client.usersData = require("./src/models/user.js");
client.logger = require("./src/modules/Logger");
client.wait = require("util").promisify(setTimeout);

fs.readdir(path.resolve(__dirname, "src", "commands"), (err, files) => {
	if (err) console.error(err);
	files.forEach((f) => {
		fs.readdir(
			path.resolve(__dirname, "src", "commands", f),
			(err2, files2) => {
				files2.forEach((file) => {
					let props = require(path.resolve(
						__dirname,
						"src",
						"commands",
						f,
						file,
					));
					client.logger.log(
						`Yüklenen Komut: ${props.conf.name}. ✔`,
						"log",
					);
					client.commands.set(props.conf.name, props);
					props.conf.aliases.forEach((alias) => {
						client.aliases.set(alias, props.conf.name);
					});
				});
			},
		);
	});
});

fs.readdir(path.resolve(__dirname, "src", "events"), (err, files) => {
	if (err) return console.error(err);
	files
		.filter((file) => file.endsWith(".js"))
		.forEach((file) => {
			let prop = require(path.resolve(__dirname, "src", "events", file));
			if (!prop.conf) return;
			client.on(prop.conf.name, prop);
			client.logger.log(`Yüklenen Event: ${prop.conf.name} ✔`);
		});
});
yasaklıtag = tag;

client
	.login(client.settings.BOT_TOKEN)
	.then(() =>
		client.logger.log(
			`${client.user.username}, kullanıma hazır ${client.users.cache.size} kullanıcı, ${client.guilds.cache.size} sunucu.`,
			"ready",
		),
	)
	.catch(() =>
		client.logger.error(
			"Bota giriş yapılırken başarısız olundu, lütfen geçerli bir token girin.",
		),
	);
mongoose
	.connect(client.settings.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(client.logger.log("Mongo Bağlantısı Kuruldu ✔", "log"));

client.on("ready", () => {
	taglar.findOne({ guild: client.settings.GUILD_ID }, async (err, res) => {
		if (!res) return;
		res.taglar.map((x) => {
			tag.push(x);
		});
	});
});
/*
client
	.on("disconnect", () => client.logger.warn("Bot is disconnecting..."))
	.on("reconnecting", () => client.logger.log("Bot reconnecting...", "log"))
	.on("error", (e) => client.logger.error(e))
	.on("warn", (info) => client.logger.warn(info));
*/
process.on("uncaughtException", (err) => {
	const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
	console.error("Beklenmedik yakalanamayan hata: ", errorMsg);
	process.exit(1);
});

process.on("unhandledRejection", (err) => {
	console.error("Promise Hatası: ", err);
});

