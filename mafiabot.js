var IRC = require("internet-relay-chat");
var fs = require("fs");
var settings = require("./settings");
if (fs.existsSync("settings_dev.js")) {
	settings = require("./settings_dev");
}

var bot = new IRC(settings.botDetails);
var mainChannel = settings.mainChannel;
var mafiaChannel = settings.mafiaChannel;
var admin = settings.admin;
var specialChar = settings.specialChar;
var MAFIA_STRENGTH = settings.MAFIA_STRENGTH;
var innocentRoles = settings.innocentRoles;
var mafiaRoles = settings.mafiaRoles;
var day = true;
var dayNum = 0;
var mimickedPlayerNick;
var adminNick;

var players = {
	mafia: [],
	innocent: [],
	dead: [],
	unassigned: [
		{nick: 			"apple"},
		{nick: 			"banana"},
		{nick: 			"carrot"},
		{nick: 			"donut"},
		{nick: 			"elephant"},
		{nick: 			"freedom"},
		{nick: 			"ginger"},
		{nick: 			"honey"},
		{nick: 			"jelly"},
		{nick: 			"kangaroo"}
	]
};

var commands = {
	join: function(parameters, senderNick) {
		joinGame(senderNick);
	},
	start: function(parameters) {
		if (startGame(parameters)) {
			console.log("Players' roles delivered. The game begins!");
		}
	},
	accuse: function(parameters) {
		accusePlayer(parameters);
	},
	vote: function(parameters, senderNick, channel) {
		submitVote(parameters, senderNick, channel);
	},
	players: function() {
		console.log(players);
	},
	day: function() {
		changeDay();
	}
};

var adminCommands = {
	repeat: function(parameters) {
		repeatMessage(parameters);
	},
	mimic: function(parameters) {
		mimicPlayer(parameters);
	},
	unmimic: function(parameters) {
		mimicPlayer(parameters, true);
	}
};

var mafia = players.mafia;
var innocent = players.innocent;
var dead = players.dead;
var unassigned = players.unassigned;

//Start of IRC Server Connection Stuff
bot.on("connect", function() {
  console.log("Bot connected");
});

bot.connect();

bot.on("registered", function() {
  bot.join(mainChannel);
	bot.join(mafiaChannel);
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
		adminNick = sender.nick;
	}

	if (message.charAt(0) == specialChar) {
		var messageSplit = message.indexOf(" ");
		var command = message.substr(1, messageSplit - 1);
		var parameters = message.substr(messageSplit + 1);
		if (messageSplit < 0) command = message.substr(1);

		if (commands[command] !== undefined) {
			commands[command](parameters, sender.nick, channel);
		} else if ((adminCommands[command] !== undefined) && (adminCommand === true)) {
			adminCommands[command](parameters, sender.nick, channel);
		} else {
			console.log("Unknown command from " + sender.nick + ": " + message);
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

function startGame(parameters) {
	var numPlayers = unassigned.length;
	if (numPlayers <= 3) {
		console.log("Not enough players. At least 4 players are required.");
		return false;
	}
	var numMafia = Math.floor(Math.sqrt(numPlayers) * MAFIA_STRENGTH);
	var numInnocent = numPlayers - numMafia;

	for (i = 0; i < numMafia; i++) {
		var chosenMafiaNum = Math.floor(Math.random() * (numPlayers - i));
		mafia.push({nick:(unassigned[chosenMafiaNum].nick),
			godfather: false,
			protected:	false,
			voted: false,
			numVotes: 0
		});
		unassigned.splice(chosenMafiaNum, 1);
	}

	for (i = 0; i < numInnocent; i++) {
		innocent.push({nick:(unassigned[0].nick),
			detective: false,
			angel: false,
			protected:	false,
			voted: false,
			numVotes: 0
		});
		unassigned.splice(0, 1);
	}
	unassigned = [];

	for (var role in innocentRoles) {
		if (innocentRoles.hasOwnProperty(role) && innocentRoles[role]) {
			innocent[Math.floor(Math.random() * (numInnocent))][role] = true;
		}
	}
	for (role in mafiaRoles) {
		if (mafiaRoles.hasOwnProperty(role) && mafiaRoles[role]) {
			mafia[Math.floor(Math.random() * (numMafia))][role] = true;
		}
	}
	return true;
}

function submitVote(player, voter, channel) {
	if (channel == mainChannel) {
		return dayVote(player, voter);
	} else if (channel == mafiaChannel) {
		return nightVote(player, voter);
	}
}

function dayVote(player, voter) {
	if (day === false) {
		console.log("You can't vote at night!");
		return false;
	}
	var playerTeam = findPlayerTeam(player);
	var playerNum;
	var voterTeam;
	var voterNum;
	if (playerTeam == "mafia" || playerTeam == "innocent") {
		playerNum = findPlayerTeam(player, true);
		voterTeam = findPlayerTeam(voter);
		voterNum = findPlayerTeam(voter, true);
		if (!players[voterTeam][voterNum].voted) {
			players[playerTeam][playerNum].numVotes++;
			players[voterTeam][voterNum].voted = true;
			return true;
		} else {
			console.log(voter + " already voted!");
			return false;
		}
	} else if (playerTeam == "dead") {
		console.log("You can't vote for dead players!");
		return false;
	} else if (playerTeam == "unassigned") {
		console.log(player + " is not in the game!");
		return false;
	} else {
		console.log(player + "not found.");
		return false;
	}
}

function nightVote(player, voter) {
	if (day === true) {
		console.log("You can only vote at night!");
		return false;
	}
	var playerTeam = findPlayerTeam(player);
	var playerNum;
	var voterTeam;
	var voterNum;
	if (playerTeam == "innocent") {
		playerNum = findPlayerTeam(player, true);
		voterTeam = findPlayerTeam(voter);
		voterNum = findPlayerTeam(voter, true);
		if (!players[voterTeam][voterNum].voted) {
			players[playerTeam][playerNum].numVotes++;
			players[voterTeam][voterNum].voted = true;
			return true;
		} else {
			console.log(voter + " already voted!");
			return false;
		}
	} else if (playerTeam == "mafia") {
		console.log("You can't vote for fellow mafia!");
		return false;
	} else if (playerTeam == "dead") {
		console.log("You can't vote for dead players!");
		return false;
	} else if (playerTeam == "unassigned") {
		console.log(player + " is not in the game!");
		return false;
	} else {
		console.log(player + "not found.");
		return false;
	}
}

function changeDay() {
	day = !day;

	//Transition from day to night
	if (day === false) {
		var maxVotes = 0;
		var votedPlayer;
		for (i = 0; i < innocent.length; i++) {
			if (innocent[i].numVotes > maxVotes) {
				votedPlayer = innocent[i].nick;
			}
		}
		for (i = 0; i < mafia.length; i++) {
			if (mafia[i].numVotes > maxVotes) {
				votedPlayer = mafia[i].nick;
			}
		}
		if (votedPlayer !== undefined) {
			console.log(votedPlayer + " has been voted to be killed!");
			console.log(votedPlayer + " was " + findPlayerTeam(votedPlayer));
			killPlayer(votedPlayer);
		}
	}

	//Transition from night to day
	if (day === true) {
		dayNum++;
	}
}

function mimicPlayer(player, undo) {
	if (undo !== true) {
		mimickedPlayerNick = players[findPlayerTeam(player)][findPlayerTeam(player, true)].nick;
		players[findPlayerTeam(player)][findPlayerTeam(player, true)].nick = adminNick;
	} else {
		players[findPlayerTeam(adminNick)][findPlayerTeam(adminNick, true)].nick = mimickedPlayerNick;
		mimickedPlayerNick = undefined;
	}
}
