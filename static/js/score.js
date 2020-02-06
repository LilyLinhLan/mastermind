function loadScore() {
    $.get('/scores', function(data, status) {
    console.log(data)
        var scores = JSON.parse(data);
        $("#scores").html(`<tr>
            <th>Rank</th>
            <th>User name</th>
            <th>Wins</th>
            <th>Loses</th>
         </tr>`);

        for (i = 0; i < scores.length; i++) {
        const rowToAppend = `
            <tr>
               <td> ${i + 1} </td>
               <td> ${scores[i].username} </td>
               <td> ${scores[i].wins} </td>
               <td> ${scores[i].looses} </td>
            </tr>`;
            $("#scores").append(rowToAppend);
        }
    });
}
//after loading html, call  loadScore()
$(document).ready(function(){
  loadScore();
});