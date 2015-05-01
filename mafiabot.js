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
var MAFIA_STRENGTH = 0.6; //Default 0.6 //Higher means more mafia
//STOP EDITING//

var signups = [
];

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
var day = true;

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
			case "join":
				if (commandAccess == "none") {
					joinGame(sender.nick);
				}
				break;
			case "start":
				if (adminCommand) {
					if (startGame() == true) {
						console.log("Players' roles delivered. The game begins!");
					}
				}
				break;
			case "accuse":
				if (adminCommand || commandAccess == "detective") {
					accusePlayer(message.split(" ", 2)[1]);
				}
				break;
			case "vote":
				//Vote for Player Death
				break;
			case "players":
				if (adminCommand) {
					console.log(players);
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

function accusePlayer(player) {
	console.log("Accusing player: " + player);
	switch (findPlayerTeam(player)) {
		case "mafia":
			console.log(player + " accused and was a mafia member.");
			killPlayer(player, "accusation");
			break;
		case "innocent":
			console.log(player + " accused and was innocent.");
			killPlayer(player, "accusation");
			break;
		case "dead":
			console.log(player + " is already dead and cannot be accused.");
			break;
		default:
			console.log("Player " + player + " not found.");
	}
}

function findPlayerTeam(player, number) {
	for (i = 0; i < mafia.length; i++) {
		console.log("FINDING: " + mafia[i].nick);
		if (mafia[i].nick == player) {
			if (number) return i;
			else return "mafia";
		}
	}
	for (i = 0; i < innocent.length; i++) {
		console.log("FINDING: " + innocent[i].nick);
		if (innocent[i].nick == player) {
			if (number) return i;
			else return "innocent";
		}
	}
	for (i = 0; i < dead.length; i++) {
		console.log("FINDING: " + dead[i].nick);
		if (dead[i].nick == player) {
			if (number) return i;
			else return "dead";
		}
	}
	return false;
}

function killPlayer(player, cause) {
	if (findPlayerTeam(player) == "mafia") {
		dead.push({nick:player, mafia:true});
		mafia.splice(findPlayerTeam(player, true), 1);
	}
	if (findPlayerTeam(player) == "innocent") {
		dead.push({nick:player, mafia:false});
		innocent.splice(findPlayerTeam(player, true), 1);
	}
}

function joinGame(player) {
	signups.push(player);
	console.log(player);
}

function startGame() {
	var numPlayers = signups.length;
	if (numPlayers <= 3) {
		console.log("Not enough players. At least 4 players are required.");
		return false;
	}
	var numMafia = Math.floor(Math.sqrt(numPlayers) * MAFIA_STRENGTH);
	var godfatherExists = numMafia >= 3 ? true : false;
	//Determine number of roles if any
	//Select players for mafia
	//Select players to have modifiers
}
