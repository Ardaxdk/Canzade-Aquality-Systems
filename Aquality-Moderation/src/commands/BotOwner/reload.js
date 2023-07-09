const moment = require("moment");
require("moment-duration-format");
let serverSettings = require("../../models/serverSettings");

module.exports = {
	conf: {
		name: "reload",
		usage: "reload",
		category: "BotOwner",
		description: "Botu yeniden başlatır.",
		aliases: ["reload", "reboot"],
	},

	async run(client, message, args) {
		let server = await serverSettings.findOne({
			guildID: message.guild.id,
		});
		if (!server.BotOwner.includes(message.author.id)) return;
		/* if(params[0]) {
        let customId  = params[0].toLowerCase()
        try {
          delete require.cache[require.resolve(`./${customId}.js`)]
          client.commands.delete(customId)
          const pull = require(`./${customId}.js`)
          client.commands.set(customId, pull)
        } catch(e) {
          return message.channel.send({ content: `Bir hata oluştu ve **${customId}** adlı komut reloadlanamadı.}`)
        }
    
        message.channel.send({ content: `__**${customId}**__ adlı komut yeniden başlatılıyor!`} ).then(x => {setTimeout(() => { x.delete(); }, 5000);}).catch(() => { })
    
       return
      }*/
		message.channel
			.send({ content: `__**Bot**__ yeniden başlatılıyor!` })
			.then((msg) => {
				console.log("[BOT] Yeniden başlatılıyor...");
				process.exit(0);
			});
	},
};
