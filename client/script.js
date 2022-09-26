const serverRoot = "http://localhost:5000/";

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var lock = false;
var next = "start";

async function GET(path, data) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let background = new Image();
            background.src = this.response
            document.getElementById("test").innerHTML = this.responseText;
        }
    };
    req.open("GET", serverRoot + path, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send();
}

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
