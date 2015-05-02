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
var MAFIA_STRENGTH = 0.75; //Default 0.75 //Higher means more mafia
var roles = {
	//Innocent Roles
	detective: true,
	angel: true,

	//Mafia Roles
	godfather: true
};
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
	],
	unassigned: [
		{nick: 			"jelly"},
		{nick: 			"kangaroo"}
	]
};

var mafia = players.mafia;
var innocent = players.innocent;
var dead = players.dead;
var unassigned = players.unassigned;
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
				if (true) {
					joinGame(sender.nick);
				}
				break;
			case "start":
				if (adminCommand) {
					if (startGame()) {
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
	for (i = 0; i < unassigned.length; i++) {
		console.log("FINDING: " + unassigned[i].nick);
		if (unassigned[i].nick == player) {
			if (number) return i;
			else return "unassigned";
		}
	}
	return false;
}

function killPlayer(player, cause) {
	if (findPlayerTeam(player) == "mafia") {
		dead.push({nick:player, mafia:true});
		mafia.splice(findPlayerTeam(player, true), 1);
		return true;
	}
	if (findPlayerTeam(player) == "innocent") {
		dead.push({nick:player, mafia:false});
		innocent.splice(findPlayerTeam(player, true), 1);
		return true;
	}
	return false;
}

function joinGame(player) {
	if (findPlayerTeam(player) == "unassigned") {
			console.log(player + " cannot join the game twice!");
		return;
	}
	unassigned.push({nick:player});
	console.log(player);
}

function startGame() {
	var numPlayers = unassigned.length;
	if (numPlayers <= 3) {
		console.log("Not enough players. At least 4 players are required.");
		return false;
	}
	var numMafia = Math.floor(Math.sqrt(numPlayers) * MAFIA_STRENGTH);

	for (i = 0; i < numMafia; i++) {
		var chosenMafiaNum = Math.floor(Math.random() * (numPlayers - i));
		mafia.push({nick:(unassigned[chosenMafiaNum].nick),
			godfather: false,
			voted: false
		});
		unassigned.splice(chosenMafiaNum, 1);
	}

	numPlayers = unassigned.length;
	for (i = 0; i < numPlayers; i++) {
		innocent.push({nick:(unassigned[0].nick),
			detective: false,
			angel: false,
			voted: false
		});
		unassigned.splice(0, 1);
	}
	unassigned = [];
	//Select players to have modifiers
	return true;
}
