  // Initialize Firebase
var config = {
  apiKey: "AIzaSyA_rWBKTvLCXJgZXfqQnYuASgtn2YlDHvI",
  authDomain: "rps-game-a0e51.firebaseapp.com",
  databaseURL: "https://rps-game-a0e51.firebaseio.com",
  storageBucket: "rps-game-a0e51.appspot.com",
  messagingSenderId: "348895860438"
};

firebase.initializeApp(config);
const database = firebase.database();
const playersRef = database.ref().child('players');
const currentTurnRef = database.ref().child('turn');
const messageRef = database.ref().child('message');

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
    username = capitalize($("#username").val());
    console.log(username);
    getInGame();
  }
});

// listener for 'enter' in username input
$("#username").keypress(function(e) {
  if (e.keyCode === 13 && $("#username").val() !== "") {
    username = capitalize($("#username").val());
    getInGame();
  }
});


// CHAT LISTENERS
// Chat send button listener, grabs input and pushes to firebase. (Firebase's push automatically creates a unique key)
$("#chat-send").click(function() {
  if ($("#chat-input").val() !== "") {
    var message = $("#chat-input").val();
    messageRef.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });
    $("#chat-input").val("");
  }
});
// Chatbox input listener
$("#chat-input").keypress(function(e) {
  if (e.keyCode === 13 && $("#chat-input").val() !== "") {
    var message = $("#chat-input").val();
    messageRef.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });
    $("#chat-input").val("");
  }
});

// Update chat on screen when new message detected - ordered by 'time' value
 messageRef.orderByChild("time").on("child_added", function(snapshot) {
  // If idNum is 0, then its a disconnect message and displays accordingly
  // If not - its a user chat message
  if (snapshot.val().idNum === 0) {
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }
  else {
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }
  // Keeps div scrolled to bottom on each update.
  $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
});

// Function to capitalize usernames
function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Function to get in the game
function getInGame() {
  // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
  // Needed because Firebase's '.push()' creates its unique keys client side,
  // so you can't ".push()" in a ".onDisconnect"
  var chatDataDisc = database.ref("/message/" + Date.now());

  console.log('chatDataDisc' + chatDataDisc);
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

// Game logic - Tried to space this out and make it more readable. Displays who won, lost, or tie game in result div.
// Increments wins or losses accordingly.
function gameLogic(player1choice, player2choice) {
  var playerOneWon = function() {
    $("#result").html("<h2>" + playerOneData.name + "</h2><h2>Wins!</h2>");
    if (playerNum === 1) {
      playersRef.child("1").child("wins").set(playerOneData.wins + 1);
      playersRef.child("2").child("losses").set(playerTwoData.losses + 1);
    }
  };
  var playerTwoWon = function() {
    $("#result").html("<h2>" + playerTwoData.name + "</h2><h2>Wins!</h2>");
    if (playerNum === 2) {
      playersRef.child("2").child("wins").set(playerTwoData.wins + 1);
      playersRef.child("1").child("losses").set(playerOneData.losses + 1);
    }
  };
  var tie = function() {
      $("#result").html("<h2>Tie Game!</h2>");
    };
    if (player1choice === "Rock" && player2choice === "Rock") {
      tie();
    }
    else if (player1choice === "Paper" && player2choice === "Paper") {
      tie();
    }
    else if (player1choice === "Scissors" && player2choice === "Scissors") {
      tie();
    }
    else if (player1choice === "Rock" && player2choice === "Paper") {
      playerTwoWon();
    }
    else if (player1choice === "Rock" && player2choice === "Scissors") {
      playerOneWon();
    }
    else if (player1choice === "Paper" && player2choice === "Rock") {
      playerOneWon();
    }
    else if (player1choice === "Paper" && player2choice === "Scissors") {
      playerTwoWon();
    }
    else if (player1choice === "Scissors" && player2choice === "Rock") {
      playerTwoWon();
    }
    else if (player1choice === "Scissors" && player2choice === "Paper") {
      playerOneWon();
    }
}


