const serverRoot = "http://localhost:5000/";

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var lock = false;
var next = "start";

function test_ajax() {
    if(lock) {
        return;
    }

    lock = true;
    fetch(serverRoot + next)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            let background = new Image();
            background.src = "images/" + data["background"];
            background.onload = function() {
                ctx.drawImage(background, 0, 0);
            }

            next = next == "start" ? "next" : "start";
            lock = false;
        })
}

function set_scene(path) {
    ;
}
