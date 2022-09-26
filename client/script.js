const serverRoot = "http://localhost:5000/";

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var lock = false;
var next = "start";

function test_ajax() {
    go_to_scene();
}

function go_to_scene() {
    if(lock) {
        return;
    }

    lock = true;
    console.log("A");
    fetch(serverRoot + next)
        .then(function(response) {
            console.log("B");
            return response.json();
        })
        .then(function(data) {
            console.log("C");
            let background = new Image();
            background.src = "images/" + data["background"];
            background.onload = function() {
                ctx.drawImage(background, 0, 0);
                document.getElementById("controls").getElementsByTagName("span")[0].textContent = data["description"];
            }

            // next = next == "start" ? "next" : "start";
            lock = false;
        })
}

function set_scene(path) {
    ;
}

function toggle_editor() {
    let collapse_button = document.getElementById("collapse_editor");

    if(collapse_button.textContent == ">>") {
        document.querySelector("#editor h2").classList.add("hide");
        document.getElementById("controls").classList.add("hide");
        document.getElementById("add_transition").classList.add("hide");
        document.getElementById("editor").classList.add("collapsed");
        collapse_button.textContent = "<<";
    }
    else {
        document.querySelector("#editor h2").classList.remove("hide");
        document.getElementById("controls").classList.remove("hide");
        document.getElementById("add_transition").classList.remove("hide");
        document.getElementById("editor").classList.remove("collapsed");
        collapse_button.textContent = ">>";
    }
}
