  // Initialize Firebase
var config = {
  apiKey: "AIzaSyA_rWBKTvLCXJgZXfqQnYuASgtn2YlDHvI",
  authDomain: "rps-game-a0e51.firebaseapp.com",
  databaseURL: "https://rps-game-a0e51.firebaseio.com",
  storageBucket: "rps-game-a0e51.appspot.com",
  messagingSenderId: "348895860438"
};

firebase.initializeApp(config);
var database = firebase.database();
var playersRef = database.ref().child('players');
var currentTurnRef = database.ref().child('turn');
var messageRef = database.ref().child('message');

playersRef.on('value', function(snap) {
  console.log(snap.val());
});

currentTurnRef.on('value', function(snap) {
  console.log(snap.val());
});

messageRef .on('value', function(snap) {
  console.log(snap.val());
});

var username = 'temp';
var currentPlayers = null;
var currentTurn = null;
var playerNum = false;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;

// Start button - takes username and tries to get user in game
$("#start").click(function() {
  if ($("#username").val() !== "") {
    username = $("#username").val().toUpperCase();
    console.log(username);
    getInGame();
  }
});

// Function to get in the game
function getInGame() {
  // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
  // Needed because Firebase's '.push()' creates its unique keys client side,
  // so you can't ".push()" in a ".onDisconnect"
  var chatDataDisc = database.ref("/message/" + Date.now());
  // Checks for current players, if theres a player one connected, then the user becomes player 2.
  // If there is no player one, then the user becomes player 1
  if (currentPlayers < 2) {
    if (playerOneExists) {
      playerNum = 2;
    }
    else {
      playerNum = 1;
    }
    // Creates key based on assigned player number
    playerRef = database.ref("/players/" + playerNum);
    // Creates player object. 'choice' is unnecessary here, but I left it in to be as complete as possible
    playerRef.set({
      name: username,
      wins: 0,
      losses: 0,
      choice: null
    });
    // On disconnect remove this user's player object
    playerRef.onDisconnect().remove();
    // If a user disconnects, set the current turn to 'null' so the game does not continue
    currentTurnRef.onDisconnect().remove();
    // Send disconnect message to chat with Firebase server generated timestamp and id of '0' to denote system message
    chatDataDisc.onDisconnect().set({
      name: username,
      time: firebase.database.ServerValue.TIMESTAMP,
      message: "has disconnected.",
      idNum: 0
    });
    // Remove name input box and show current player number.
    $("#swap-zone").html("<h2>Hi " + username + "! You are Player " + playerNum + "</h2>");
  }
  else {
    // If current players is "2", will not allow the player to join
    alert("Sorry, Game Full! Try Again Later!");
  }
}