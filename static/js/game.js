var game = null;
var current_guess = [];

// Generate a next guess
function nextGuess() {
    var num_codes = gameSize();
    var index = 0;
    while (true) {
        current_guess[index] += 1;
        if (current_guess[index] < 8) {
            break;
        }
        current_guess[index] = 0;
        index += 1;
        if (index >= num_codes) {
            index = 0;
            break;
        }
    }
    var return_val = "";
    for (var i = 0; i < current_guess.length; i++) {
        return_val += current_guess[i]
    }
    return return_val;
}

function computerPlay() {
    guess_value = '';
    // First find a valid guess
    while (true) {
        guess_value = nextGuess();
        if (isValidGuess(guess_value)) {
            break;
        }
    }
    // Only send valid guess to server
    sendGuessRequest(guess_value);
}

// Renders the game page with the given gameinfo object from the server
function renderGame(gameinfo) {
    // Do not redirect if we are already in result page, otherwise, we have recursive reloading
    if (!$(location).attr('href').includes("/result") && (gameinfo.status == 'WIN' || gameinfo.status == 'LOOSE')) {
        $(location).attr('href', '/result?gameid=' + gameinfo.gameid); //redirect to results page
    }

    // Update the global var game
    game = gameinfo;


    // Check the right radio button corresponding to the number of codes of the game
    $("#" + gameinfo.num_codes + "_codes").attr("checked", true);

    $('#guess').attr("disabled", true);
    $('#checkconflict').attr("disabled", true);

    // Render input table
    renderInput(gameinfo.num_codes);

    // Render history table
    renderHistory(gameinfo);
}

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
    for (i = 1; i< num_code + 1; i++) {
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
        $('#guess').attr("disabled", false);
        $('#checkconflict').attr("disabled", false);
    }
}


// Checks if a new guess matches with a single history guess.
// A guess can not be the solution if the numbers of correct digits and partial correct digits
// computed by comparing it with the history guess do not match with the history results
function matchHistoryGuess(history_guess_obj, new_guess) {
    // First we pretend the new guess is the solution and compute the numbers of
    // correct digits and partial correct digits for the history guess
    var no_correct = 0;
    var no_partial_correct = 0;
    var remaining_history_guess_obj = [];
    var remaining_new_guess = [];
    for(i=0; i < history_guess_obj.guess_value.length; i++) {
        if (new_guess.charAt(i) == history_guess_obj.guess_value.charAt(i)) {
            no_correct+=1;
        } else {
            remaining_history_guess_obj.push(new_guess.charAt(i));
            remaining_new_guess.push(history_guess_obj.guess_value.charAt(i));
        }
    }
    for(i=0; i< remaining_history_guess_obj.length; i++) {
        var index = remaining_new_guess.indexOf(remaining_history_guess_obj[i]);
        if (index >= 0) {
            no_partial_correct+=1;
            remaining_new_guess.splice(index, 1);
        }
    }

    // The compare the computed results with the history results
    return history_guess_obj.no_correct == no_correct && history_guess_obj.no_partial_correct == no_partial_correct;
}

// Checks if a new guess is valid or not. If a guess is the solution, it should
// match all history guesses
function isValidGuess(new_guess) {
    for (var i=0; i < game.guesses.length; i++) {
        if (!matchHistoryGuess(game.guesses[i], new_guess)) {
            return false;
        }
    }
    return true;
}

function checkConflict() {
    new_guess = getUserCode();
    $("#guess_${guess.guess_number}").html("");
    for (var i=0; i < game.guesses.length; i++) {
       if (matchHistoryGuess(game.guesses[i], new_guess)) {
            $(`#guess_${i+1}`).css( "background-color", "green" )
       } else {
            $(`#guess_${i+1}`).css( "background-color", "red" )
       }
    }
}

var interval = null;
var timer = function() {
    // Get today's date and time
    var now = new Date().getTime();

    // Get expired time for the game
    var expiredTime = new Date(game.expired).getTime();

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
            // Set the random starting code for computer play
            num_codes = gameSize();
            current_guess = [];
            for (var i = 0; i < num_codes; i++) {
                current_guess.push(Math.floor(Math.random() * 7));
            }
        });
});
