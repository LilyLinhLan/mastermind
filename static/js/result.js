$(document).ready(function(){
  gameid = $("#gameid").val();
  $.get("/gameinfo/" + gameid,
        function(data, status) {
            var gameinfo = JSON.parse(data);
            renderHistory(gameinfo);
        });
});