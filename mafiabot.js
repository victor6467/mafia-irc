var IRC = require("internet-relay-chat");
//START EDITS HERE//
var bot = new IRC({
	"username": "MafiaBot",
	"nick": "MafiaBot"
});
var mainChannel = "";
var admin = "";
var specialChar = "-";
//STOP EDITING//

var players = {
	mafia: [
		{nick: 			"apple",
		godfather: 	false},
		{nick: 			"banana",
		godfather: 	true}
	],
	innocent: [
		{nick:			"carrot",
		detective:	true,
		angel:			false},
		{nick:			"dount",
		detective:	false,
		angel:			true},
		{nick:			"elephant",
		detective:	false,
		angel:			false},
		{nick:			"freedom",
		detective:	false,
		angel:			false},
		{nick:			"ginger",
		detective:	false,
		angel:			false}
	],
	dead: [
		{nick: 			"honey",
		mafia: 			true},
		{nick: 			"infared",
		mafia: 			false}
	]
};
var mafia = players.mafia;
var innocent = players.innocent;
var dead = players.dead;

//Start of IRC Server Connection Stuff
bot.on("connect", function() {
  console.log("Bot connected");
});

bot.connect();

bot.on("registered", function() {
  bot.join(mainChannel);
	console.log("Bot registered");
});

bot.on("join", function(user, channel) {
	if (user.nick == this.options.nick) console.log("Bot joined " + channel);
});
//End of IRC Server Connection Stuff

bot.on("message", function(sender, channel, message) {
	var commandAccess;
	var adminCommand = false;
  if (sender.hostmask == admin) {
		console.log("Sent From Admin");
		adminCommand = true;
	}

	if (message.charAt(0) == specialChar) {
		var command = message.split(" ")[0];
		switch (command.substring(1)) {
			case "repeat":
				if (adminCommand) {
					repeatMessage(message.split(" ", 2)[1]);
				}
				break;
			case "accuse":
				if (adminCommand || commandAccess == "detective") {
					accusePlayer(message.split(" ", 2)[1]);
				}
				break;
			default:
				bot.message(mainChannel, "Unknown command");
		}
	}
});

function repeatMessage(message) {
	console.log("Sending message to " + mainChannel + ": " + message);
	bot.message(mainChannel, message);
}

function accusePlayer(message) {
	console.log("Accusing player: " + message);
	if (confirmPlayerName(message, mafia)) {
		console.log(message + " Found");
	}
}

function confirmPlayerName(nickCheck, side, role) {
	for (i = 0; i < side.length; i++) {
		console.log(side[i].nick);
		if (side[i].nick == nickCheck) {
			return true;
		}
	}
}
