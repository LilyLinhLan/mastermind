color_map = {
    "0": "violet",
    "1": "blue",
    "2": "red",
    "3": "green",
    "4": "orange",
    "5": "purple",
    "6": "yellow",
    "7": "teal"
}

var expiredTime = null;

// Renders the game page with the given gameinfo object from the server
function renderGame(gameinfo) {
    // Do not redirect if we are already in result page, otherwise, we have recursive reloading
    if (!$(location).attr('href').includes("/result") && (gameinfo.status == 'WIN' || gameinfo.status == 'LOOSE')) {
        $(location).attr('href', '/result?gameid=' + gameinfo.gameid); //redirect to results page
    }

    expiredTime = new Date(gameinfo.expired).getTime();

    // Check the right radio button corresponding to the number of codes of the game
    $("#" + gameinfo.num_codes + "_codes").attr("checked", true);

    // Render input table
    renderInput(gameinfo.num_codes);

    // Render history table
    renderHistory(gameinfo);
}

function renderInput(num_codes) {
    // Render color table
    $("#colortable").html("");
    for (const [code, color] of Object.entries(color_map)) {
        var color_row = "<tr>";
        for (var i = 0; i < num_codes; i++) {
            color_row += `<td onclick="setInput(${i+1}, ${code}, ${num_codes})" bgcolor=${color}> ${code} </td>`;
        }
        color_row += "</tr>";
        $("#colortable").append(color_row);
    }

    // Render input row
    color_input = "<tr>";
    for (var i = 0; i < num_codes; i++) {
        color_input += `<td id="code${i+1}"> </td>`;
    }
    color_input += "</tr>";
    $("#colorinput").html(color_input);
}

function getUserCode() {
    var guess_value = "";
    var num_codes = gameSize();
    for (var i = 1; i < num_codes + 1; i++) {
        guess_value += $('#code' + i).html()
    }
    return guess_value;
}

function renderHistory(gameinfo) {
    var header = '<tr> <th> Guess No</th>';
    for (var i = 1; i < gameinfo.num_codes + 1; i++) {
        header += `<th> Code ${i} </th>`;
    }
    header += `<th colspan="${gameinfo.num_codes}"> Results </th> </tr>`;
    $("#history").html(header);

    // Render a row for each guess
    gameinfo.guesses.forEach(function(guess) {
        var rowToAppend = `<tr> <td> ${guess.guess_number} </td>`;
        for (var i = 0; i < gameinfo.num_codes; i++) {
            rowToAppend += `<td bgcolor=${color_map[guess.guess_value[i]]}> ${guess.guess_value[i]} </td>`;
        }

        for (i = 0; i < guess.no_correct; i++) {
            rowToAppend += '<td bgcolor="black"> </td>';
        }
        for (i = 0; i < guess.no_partial_correct; i++) {
            rowToAppend += '<td bgcolor="grey"> </td>';
        }
        for (i = 0; i < gameinfo.num_codes - guess.no_correct - guess.no_partial_correct; i++) {
            rowToAppend += '<td bgcolor="white"> </td>';
        }
        rowToAppend += "</tr>";
        $("#history").append(rowToAppend);
    });

    // Create empty rows for remaining guesses
    for (var i = 0; i < gameinfo.max_guess - gameinfo.guesses.length; i++) {
        var rowToAppend = `<tr> <td> ${i + 1 + gameinfo.guesses.length} </td>`;
        for (var j = 0; j < 2 * gameinfo.num_codes; j++) {
            rowToAppend += '<td> </td>';
        }
        rowToAppend += "</tr>";
         $("#history").append(rowToAppend);
    }
}