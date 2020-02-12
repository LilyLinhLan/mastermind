// Creates a game with a given number of codes
function createGame(num_code) {
    $.post('/new_game2',
        {num_code:num_code},
        function(data, status) {
            $(location).attr('href', '/game/' + data);
        });
}

// Creates a new game with the same number of codes as the current game
function newGame() {
    return createGame(gameSize());
}

// Plays game with a list of random codes
function playRandom() {
    var num_code = gameSize();
    for (i=1; i< num_code +1; i++) {
        setInput(i, Math.floor(Math.random() * 7), num_code)
    }
}

// Returns number of codes in the game
function gameSize() {
    return $("#history").children('tbody').children('tr').children('th').length - 2;
}

// Shows hint of correct code in one random column
function getHint() {
     gameid = $("#gameid").val();
     $.get("/gameinfo/" + gameid,
        function(data, status) {
            var gameinfo = JSON.parse(data);
            code_length = gameinfo.secret_code.length
            random_hint_index = Math.floor(Math.random() * code_length);
            setInput(random_hint_index + 1, gameinfo.secret_code[random_hint_index], code_length)
            $('#get_hint').attr("disabled", true)
        });
}

// Sends a guess to server and re-render the page with the response from server
function submitGuess() {
    $('input[name="num_codes"]').attr("disabled", true)
    gameid = $("#gameid").val();
    var guess_value = getUserCode();
    sendGuessRequest(guess_value);
}

function sendGuessRequest(guess_value) {
    $.post("/guess2",
        {
            gameid: gameid,
            guess_value: guess_value
        },
        function(data, status) {
            console.log(data);
            var gameinfo = JSON.parse(data);
            renderGame(gameinfo, true);
        });
}

// Sets the input column defined by an index with a given code
function setInput(index, code, num_codes) {
    $("#code" + index).html(code);
    $("#code" + index).css("background-color", color_map[code]);

    // Check if we can enable guess button
    var enabled = true;
    for (var i = 1; i < num_codes + 1; i++) {
        if ($.trim($("#code" + i).html()) == '') { // check if the cell is empty
            enabled = false;
            break;
        }
    }
    if (enabled) {
        // Submit a guess if all input codes are ready
        submitGuess();
    }
}

var interval = null;
var timer = function() {
    // Get today's date and time
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var remaining = expiredTime - now;

    // Time calculations for days, hours, minutes and seconds
    var minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo"
    $("#timer").html("Remaining time: " + minutes + "m " + seconds + "s ");

    // If the count down is over, write some text
    if (remaining < 0) {
        clearInterval(interval);
        $("#timer").html("EXPIRED");
        gameid = $("#gameid").val();
        $.post('/timeout/' + gameid, function(data, status) {
            var gameinfo = JSON.parse(data);
            renderGame(gameinfo);
        })
    }
}

$(document).ready(function(){
  gameid = $("#gameid").val();
  interval = setInterval(timer, 1000);
  $.get("/gameinfo/" + gameid,
        function(data, status) {
            var gameinfo = JSON.parse(data);
            renderGame(gameinfo);
        });
});
