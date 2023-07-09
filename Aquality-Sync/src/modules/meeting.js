const data = require("../models/toplantı.js");

module.exports = async (client) => {
	setInterval(async () => {
		let meetings = await data.find({
			active: true,
		});

		meetings.forEach(async (meeting) => {
			meeting.active = false;
			await meeting.save();
		});
	}, 90 * 60 * 1000);
};
