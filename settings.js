module.exports = {
  botDetails: {
    "username": "MafiaBot",
    "nick": "MafiaBot"
  },
  mainChannel: "",
  admin: "",
  specialChar: "-",

  MAFIA_STRENGTH: 0.75, //Default 0.75 //Higher means more mafia
  innocentRoles: {
    detective: true,
    angel: true
  },
  mafiaRoles: {
    godfather: true
  },
  roles: {
  	//Innocent Roles
  	detective: [true, "innocent"],
  	angel: [true, "innocent"],
  	//Mafia Roles
  	godfather: [true, "mafia"]
  }
};
