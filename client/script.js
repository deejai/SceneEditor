const serverRoot = "http://localhost:5000/";

const r = 25;

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var scene = null;

var lock = false;

go_to_scene("start");

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    for(let transition of scene.transitions) {
        const dist_from_point = Math.sqrt(Math.pow(transition.x - x, 2) + Math.pow(transition.y - y, 2));
        if(dist_from_point <= r) {
            go_to_scene(transition.path);
            break;
        }
        else {
            console.log(dist_from_point);
        }
    }
}

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

function go_to_scene(path) {
    if(lock) {
        return;
    }

    lock = true;
    fetch(serverRoot + path)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            scene = data;
            let background = new Image();
            background.src = "images/" + scene.background;
            background.onload = function() {
                ctx.drawImage(background, 0, 0);
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = "red";
                for(let transition of scene.transitions) {
                    ctx.beginPath();
                    ctx.arc(transition.x, transition.y, r, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
                document.getElementById("description").textContent = scene.description;
            }

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
