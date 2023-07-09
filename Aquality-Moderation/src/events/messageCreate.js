const moment = require("moment");
const ms = require("ms");
const Discord = require("discord.js");
moment.locale("tr");
const commandDBS = require("../models/vrcRoleCommands");
let serverSettings = require("../models/serverSettings");
const client = global.client;
let complimentCount = 0;
module.exports = async (message) => {
	const data = {};

	let server = await serverSettings.findOne({});

	if (message.author.bot && message.author.id !== client.user.id) return;

	if (message.channel.id == server?.GeneralChat) {
		if (message.activity !== null) {
			let obje = Object.values(message.activity);
			if (obje.includes(3)) {
				if (
					message.member.permissions.has(
						Discord.PermissionsBitField.Flags.Administrator,
					)
				)
					return;
				{
					setTimeout(() => {
						message.delete();
					}, 100);
				}

				message.channel
					.send({
						content:
							"<@!" +
							message.author.id +
							"> Spotify etkinlerinizi genel chat üzerinde paylaşamazsınız!",
					})
					.then((msg) => {
						setTimeout(() => {
							msg.delete();
						}, 5000);
					});
			}
		}
	}

	let compliments = [
		"Anlatsana biraz neden bu kadar mükemmelsin?",
		"birbirimizi çift görmem için kaç duble daha içmeliyim?",
		"beni biraz takar mısın?",
		"Çikolatalı keksin bu alemde teksin",
		"Kakaolu sütsün seni sevmeyen ölsün",
		"meleksin ama canımı alıyorsun yoksa Azrailim misin?",
		"Hangi davalara bakıyorsun söyle de o suçu işliyim",
		"Oha bu çocuk Türk müüüüüüüüüüüü?",
		"Ben küçücük bi botum ama sana kocaman sarılırım",
		"Bana yüzünü dönme gece oluyor sanıyorum.",
		"bu güne aynayı öperek başladım",
		"Sana gemi alalım dümende bir numarasın.",
		"Numaramı soran olursa, değiştirmedim hala 1 numarayım",
		"yemeğimi yedim şimdi seni yeme vakti",
		"Corona olsan bile sana sarılırdım",
		"Kafam çok güzel çünkü içinde sen varsın.",
		"akıllara zarar bi mükemmelliğin var",
		"Hayatımın özeti; bu sayfa görüntülenemiyor.",
		"Buralarda yeniyim de kalbinin yolunu tarif eder misin?",
		"Sokakları bilmem ama benim gönlüm hep sana çıkıyor",
		"seni her gün görenlerin şansından istiyorum",
		"en iyisine layıksın yani bana hıh",
		"bunun adı kalp güzelim. Tersten okuduğun gibi plak değil ki sürekli sende takılı kalsın.",
		"Yarın sokağa çıkma yasağı olmasa ne olur benim sokağım sana çıkmadıktan sonra",
		"Dün hastaneye gittim kalp röntgenimi çektiler. çok güzel çıkmışsın",
		"Dünyanın en güzel manzarasına sırtımı döner gülüşünü izlerim",
		"çok güzel bi tablo gördüm tam alacaktım ama aynaymış...",
		"canın yandı mı? cenneten düşerken?",
		"Nasılsın diye sorma bebeğim, sana göreyim kıpss",
		"taş gibisin!",
		"Polisi arıyorum çünkü bu kadar tatlı olman yasadışı !",
		"bi alo de gelmezsem gençliğim solsun.",
		"Güneş aya ben sana tutuldum.",
		"Oha sen gerçek misin ?",
		"Gece oluncа bir sessizlik, sensizlik.",
		"Canımın içi, sen hangi şiirden kaçıp geldin yüreğimin orta yerine?",
		"sarılalım mı?",
		"sen beni bir de sevgilinken gör",
		"hava sıcak değil aşkından yanıyorum",
		"dalin gibi kokuyorsun",
		"benimle evlenir misin?",
		"Kalbinin yolunu gösterir misin...",
		"Çünkü sen komutuma debug oldun",
		"Verilmiş sadakam varsa geri alabilir miyim? Paraya sıkıştım da.",
		"azrail bile ayağıma geliyor ne bu tripler?",
		"Şey gözlerin çok güzelmiş tanışalım mı ?",
		"sütüm yarım yağlı mutluluğum sana bağlı",
		"sana hayatım diyorum çünkü o kadar kötüsün",
		"Telefon numaramı kaybettimde, seninkini alabilir miyim?",
		"Sana hayatım diyemem, bu kadar güzel bir yaşantım olmadı…",
		"seni seviyorum.",
		"Her şeyimi öğrenmek istiyorsan aynaya bakabilirsin",
		"Ölmene gerek yok, yanıma gel mekanın cennet olsun",
		"öpşuelimi? çabuk!",
		"Hukuk okusam nolur seni görünce aklıma hakim olamadıktan sonra",
		"iban at hayallerimi yollayayım harcarsın",
		"Kaşların yay kirpiğin ok gibi vurduğunu öldürürsün, geçme mescid kapısından çok namazlar böldürürsün...",
		"yavrum hepsi senin mi?",
		"eğer ahtapot olsaydım üç kalbimi de sana verirdim",
		"Nasıl yani şimdi sen gerçek misin?",
		"Suyun içinde klorür senin kalbinde bir ömür...",
		"2 bedende tek ruh değil miyiz sence de?",
		"Bunca zaman neredeydin ?",
		"sevgilim var yazma?",
		"Teknoloji çok ilerledi, güneşi bu kadar yakından görebildiğimize göre",
		"Alnın güzelmiş yazısı olabilir miyim ?",
		"iyi ki varsın 💕",
		"senin hava attığın yerde benim rüzgarım esiyor",
		"zenginsen evlenelim mi?",
		"attan indiysek leopar falan gelmiştir ben anlamam eşekten",
		"ateşimin çıkma sebebi corona değil, sensin",
		"Ölüm ani dünya fani bi kere sevsen nolur ki yani ?",
		"Ya sen hep böyle hoşuma mı gideceksin ?",
		"canım haddin hariç her şeyi biliyorsun",
		"Ne Sinovac vuruldum ne Biontech ben sana vuruldum bir tek...",
		"ben varya fay hattı olsam kesin daha az kırılırdım",
		"tavla oynayalım ama sen beni tavla",
		"üşüdüysen sana abayı yakayım mı?",
		"10 parmağında 10 marifet olmasına gerek yok, bir parmağında yüzüğüm olsun yeter",
		"aklın başına gelir ama ben sana gelmem",
		"o kadar haklısın ki... seni öpesim var",
		"Dünya kütüphanesindeki en güzel kitapsın",
		"sqrt(cos(x))*cos(300x)+sqrt(abs(x))-0.7)*(4-x*x)^0.01 sqrt(6-x^2)from-4.5 to 4.5",
		"AÇILIN DÜNYANIN 8.HARİKASI GELDİ !",
		"Çok tatlı olmayı bırak artık... Kalbim başa çıkamıyor !",
		"Seni bir sonraki nefesimi bekler gibi bekliyorum",
		"seni mumla ararken elektrikler geldi",
		"Kalbini dinle dediklerinde seni dinleyesim geliyor",
		"Ampulü Edison icat etti ama ışığı sen saçıyorsun",
		"8 milyar gülüş varken seninki favorim",
		"konum atta belamızı bulalım bebeğim",
		"Gülüşün şimşek içermiyiz birer milkşeyk ?",
		"Üzerinde pijama olsa bile, nasıl oluyor da her zaman bu kadar güzel görünüyorsun?",
		"artık benimsin",
	];

	if (message.channel.id == server.GeneralChat) {
		complimentCount++;
		if (complimentCount >= 50) {
			complimentCount = 0;
			let complimentsrandom =
				compliments[Math.floor(Math.random() * compliments.length)];
			message.reply({
				content: `${complimentsrandom}`,
			});
		}
	}

	let userData = await client.findOrCreateUser({
		id: message.author.id,
	});
	data.userData = userData;

	let afkReason = data.userData.sebep;
	if (afkReason) {
		let ha = moment(data.userData.tarih).fromNow();
		message.channel
			.send({
				content:
					"<@" +
					message.author.id +
					"> AFK modundan başarıyla çıkış yaptın, " +
					ha +
					" AFK olmuştun.",
			})
			.then((msg) => {
				setTimeout(() => {
					msg.delete();
				}, 7000);
			});

		let nicke = message.member.displayName.replace("[AFK]", "");
		if (message.member.manageable) message.member.setNickname(nicke);
		data.userData.sebep = null;
		data.userData.tarih = 0;
		await data.userData.save();
	}

	message.mentions.users.forEach(async (u) => {
		let userData = await client.findOrCreateUser({ id: u.id });

		let ha = moment(userData.tarih).fromNow();
		if (userData.sebep) {
			message.channel
				.send({
					content:
						"<@" +
						userData.id +
						"> " +
						ha +
						" AFK moduna geçti. Sebep: " +
						userData.sebep +
						" ",
				})
				.then((msg) => {
					setTimeout(() => {
						msg.delete();
					}, 7000);
				});
		}
	});

	let prefix = client.settings.PREFIX;
	let canım = false;
	for (const içindeki of prefix) {
		if (message.content.startsWith(içindeki)) canım = içindeki;
	}

	if (!canım) return;

	const args = message.content.slice(canım.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (message.guild && !message.member)
		await message.guild.fetchMember(message.author);

	let embed = new Discord.EmbedBuilder();
	embed.setColor("Random");

	const cmd =
		client.commands.get(command) ||
		client.commands.get(client.aliases.get(command));

	if (!cmd) {
		let res = await commandDBS.findOne({
			cmdName: message.content.split(" ")[0].slice(canım.length),
		});
		if (!res) return;

		if (
			res.allowedRoles.some((x) => message.member.roles.cache.has(x)) ==
				false &&
			!res.allowedUsers.includes(message.author.id) &&
			!server.BotOwner.includes(message.author.id) &&
			!message.member.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			)
		)
			return;
		if (res.blockedUsers.includes(message.author.id)) return;

		let member =
			message.mentions.members.first() ||
			(await client.üye(args[0], message.guild));
		if (!member) {
			client.send(
				"Bir üye etiketle ve tekrardan dene!",
				message.author,
				message.channel,
			);
		}

		let role = message.guild.roles.cache.get(res.role);
		if (!role) return;

		if (!member.roles.cache.has(role.id)) {
			await member.roles.add(role.id);
			await client.send(
				`<@${member.user.id}> üyesine <@&${role.id}> rolü verildi.`,
				message.author,
				message.channel,
			);

			const verildi = embed.setDescription(
				`<@${member.user.id}> üyesine <@&${role.id}> rolü <@${message.author.id}> tarafından verildi.`,
				message.author,
				message.channel,
			);

			await client.channels.cache
				.find((channel) => channel.name === "rol-yönet")
				.send({ embeds: [verildi] });
		} else {
			await member.roles.remove(role.id);
			await client.send(
				`<@${member.user.id}> üyesinin <@&${role.id}> rolü alındı.`,
				message.author,
				message.channel,
			);

			const alındı = embed.setDescription(
				`<@${member.user.id}> üyesinin <@&${role.id}> rolü <@${message.author.id}> tarafından alındı.`,
				message.author,
				message.channel,
			);

			await client.channels.cache
				.find((channel) => channel.name === "rol-yönet")
				.send({ embeds: [alındı] });
		}
		return;
	}

	if (!cmd) return;
	if (cmd && !message.guild && cmd.conf.guildOnly) return;

	message.flags = [];
	while (args[0] && args[0][0] === "-") {
		message.flags.push(args.shift().slice(1));
	}

	if (client.blockedFromCommand.includes(message.author.id)) return;
	if (
		!server?.BotOwner.includes(message.author.id) &&
		!server?.GuildOwner.includes(message.author.id)
	) {
		let blockArr = client.commandBlock.get(message.author.id) || [];

		let datax = {
			içerik: message.content,
			kanal: message.channel.name,
			komut: cmd.conf.name,
		};

		blockArr.push(datax);

		client.commandBlock.set(message.author.id, blockArr);

		let canzade = await client.users.fetch("331846231514939392");

		if (blockArr.length == 9) {
			message.channel.send({
				content:
					`${message.author}` +
					"```⛔ Komut kullanımını kötüye kullandığın için engellendi. Açtırmak için ( " +
					canzade.username +
					" ) kişisine ulaşman gerekiyor.```",
			});
			client.channels.cache
				.find((channel) => channel.name === "command-block")
				.send({
					content: `**${message.author.username}** - ${
						message.author
					} (\`${
						message.author.id
					}\`) komut engeli yedi. | Komut kullanım özeti:\n\`\`\`${blockArr
						.map((x) => x.içerik)
						.join("\n")}\nKullandığı komutlar: ${blockArr
						.map((x) => x.komut)
						.join(",")}\nKullandığı kanallar: ${blockArr
						.map((x) => x.kanal)
						.join(",")}\`\`\``,
				});
			client.blockedFromCommand.push(message.author.id);
		}

		setTimeout(() => {
			if (client.commandBlock.has(message.author.id)) {
				client.commandBlock.delete(message.author.id);
			}
		}, ms("1m"));
	}

	client.logger.log(
		`${message.author.username} (${message.author.id}) komut kullandı "${cmd.conf.name}" kullandığı kanal ${message.channel.name}`,
		"cmd",
	);

	cmd.run(client, message, args, data);
};

module.exports.conf = {
	name: "messageCreate",
};

