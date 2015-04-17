var IRC = require("internet-relay-chat");
var bot = new IRC({
	"username": "MafiaBot",
	"nick": "MafiaBot",
});
var mainChannel = "";
var admin = "";
var specialChar = "-";


var players = {
	mafia: [
		{name: 		"apple",
		godfather: 	false},
		{name: 		"banana",
		godfather: 	true}
	],
	innocent: [
		{name:		"carrot",
		detective:	true,
		angel:		false},
		{name:		"dount",
		detective:	false,
		angel:		true},
		{name:		"elephant",
		detective:	false,
		angel:		false},
		{name:		"freedom",
		detective:	false,
		angel:		false},
		{name:		"ginger",
		detective:	false,
		angel:		false}
	],
	dead: [
		{name: 		"honey",
		mafia: 		true},
		{name: 		"infared",
		mafia: 		false}
	]
};

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
	if(user.nick == this.options.nick) console.log("Bot joined " + channel);
});
//End of IRC Server Connection Stuff

bot.on("message", function(sender, channel, message) {
   if(sender.hostmask == admin) console.log("Sent From Admin");
	if(message.charAt(0) == specialChar) {
		if(message.indexOf("repeat") == 1) {
			repeatMessage(message.split(" ", 2));
		} else if(message.indexOf("accuse") == 1) {
			accusePlayer(message.split(" ", 2));
		}
	}
});


function repeatMessage(message) {
	console.log("Sending message to " + mainChannel + ": " + message[1]);
	bot.message(mainChannel, message[1]);
}

function accusePlayer(message) {

}

function confirmPlayerName(name, side, role) {

}
