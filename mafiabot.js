var IRC = require("internet-relay-chat");
var fs = require("fs");
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
		{
			nick: 			"apple",
			godfather: 	false,
			voted: 			false
		},
		{
			nick: 			"banana",
			godfather: 	true,
			voted: 			false
		}
	],
	innocent: [
		{
			nick:				"carrot",
			detective:	true,
			angel:			false,
			voted: 			false
		},
		{
			nick:				"donut",
			detective:	false,
			angel:			true,
			voted: 			false
		},
		{
			nick:				"elephant",
			detective:	false,
			angel:			false,
			voted:  		false
		},
		{
			nick:				"freedom",
			detective:	false,
			angel:			false,
			voted: 			false
		},
		{
			nick:				"ginger",
			detective:	false,
			angel:			false,
			voted: 			false
		}
	],
	dead: [
		{
			nick: 			"honey",
			mafia: 			true},
		{
			nick: 			"infared",
			mafia: 			false
		}
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
			case "vote":
				if (adminCommand || commandAccess == "player") {
					//Vote for player death
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
		console.log(message + " accused and was a mafia member.");
	} else if (confirmPlayerName(message, innocent)) {
		console.log(message + " accused and was innocent.");
	} else if (confirmPlayerName(message, dead)) {
		console.log(message + " cannot be accused. " + message + " is already dead.");
	} else console.log(message + " not found.");
}

function confirmPlayerName(nickCheck, side, role) {
	for (i = 0; i < side.length; i++) {
		console.log("CHECKING: " + side[i].nick);
		if (side[i].nick == nickCheck) {
			return true;
		}
	}
	return false;
}
