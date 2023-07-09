const data = require("../../models/alarm.js");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
	conf: {
		name: "alarm",
		usage: "alarm [@süre][sebep]",
		category: "Global",
		description: "Belirttiğiniz zamana alarm kurarsınız.",
		aliases: ["alarm"],
	},

	async run(client, message, args) {
		await data.findOne({ user: message.author.id }, async (err, res) => {
			let time = args[0];
			if (!time || isNaN(ms(time)))
				return message.reply({
					content: "Alarm kurmam için bir zaman belirtmelisin.",
				});
			if (!args.slice(1).join(" "))
				return message.reply({
					content: "Alarmı ne için kuracağımı belirtmedin ?",
				});
			let regex = /h?t?t?p?s?:?\/?\/?discord.?gg\/?[a-zA-Z0-9]+/;
			let regexSecond =
				/h?t?t?p?s?:?\/?\/?discorda?p?p?.?com\/?invites\/?[a-zA-Z0-9]+/;
			if (
				regex.test(message.content) == true ||
				regexSecond.test(message.content) == true
			)
				return message.reply({
					content:
						"Cidden reklamını mı hatırlamak için alarm kurdun?",
				});
			if (
				message.content.includes("@here") ||
				message.content.includes("@everyone")
			)
				return;
			if (!res) {
				const newData = new data({
					user: message.author.id,
					alarm: true,
					sebep: args.slice(1).join(" "),
					endDate: Date.now() + ms(args[0]),
					channel: message.channel.id,
				});
				await newData.save().catch((e) => console.log(e));
			} else {
				res.user = message.author.id;
				res.alarm = true;
				res.sebep = args.slice(1).join(" ");
				res.endDate = Date.now() + ms(args[0]);
				res.channel = message.channel.id;
				await res.save().catch((e) => console.log(e));
			}
			let tamam = moment(Date.now() + ms(args[0])).fromNow();
			message.reply({
				content:
					":alarm_clock: | Alarmı kurdum sana bunu " +
					tamam +
					" hatırlatacağım.",
			});
		});
	},
};
