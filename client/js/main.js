const serverRoot = "http://localhost:5001/";

const r = 25;

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var scenes = null;
var selected_transition = null;
var current_scene_key = null;
var lock = false;
var dragTransition = null;
var dragOffset = {x: 0, y: 0};
var popupElements = document.querySelectorAll(".popup");

class SceneObject {
    x;
    y;
    image;
    vertices;
}

function mouseDown(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let clicked_transition = false;
    for(let transition of scenes[current_scene_key].transitions) {
        const dist_from_point = Math.sqrt(Math.pow(transition.x - x, 2) + Math.pow(transition.y - y, 2));
        if(dist_from_point <= r) {
            clicked_transition = true;
            selected_transition = transition;
            break;
        }
    }

    if(clicked_transition == false) {
        selected_transition = null;
    }

    refreshView();
}

canvas.addEventListener('click', function(e) {
    mouseDown(canvas, e);
})

canvas.addEventListener('dblclick', function(e) {
    // go to scene
    if(selected_transition != null) {
        goToScene(selected_transition.path);
    }
    // create transition
    else {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let transition = {x: x, y: y, path: Object.keys(scenes)[0]};
        scenes[current_scene_key].transitions.push(transition);
        selected_transition = transition;
        refreshView();
    }
})

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function drag(e) {
    if(dragTransition) {
        dragTransition.x = clamp(e.clientX - dragOffset.x, 0, 800);
        dragTransition.y = clamp(e.clientY - dragOffset.y, 0, 600);
        refreshView();
    }
}

document.addEventListener('mousemove', drag);

var moveButton = document.querySelector(".popup.buttons .move");
moveButton.addEventListener('mousedown', function(e) {
    dragTransition = selected_transition;
    dragOffset.x = e.clientX - selected_transition.x;
    dragOffset.y = e.clientY - selected_transition.y;
})

var dropdownButton = document.querySelector(".popup.buttons .dropdown");
var dropdownList = document.querySelector(".popup.list");
dropdownButton.addEventListener('click', function(e) {
    dropdownList.classList.toggle("hide");
})

var deleteButton = document.querySelector(".popup.buttons .delete");
deleteButton.addEventListener('click', function(e) {
    if(selected_transition != null) {
        const index = scenes[current_scene_key].transitions.indexOf(selected_transition);
        scenes[current_scene_key].transitions.splice(index, 1);
        selected_transition = null;
        refreshView();
    }
})

var saveScenesButton = document.querySelector("#controls .save");
saveScenesButton.addEventListener('click', saveScenes);

var loadScenesButton = document.querySelector("#controls .load");
loadScenesButton.addEventListener('click', loadScenes);

document.addEventListener('mouseup', function(e) {
    dragTransition = null;
})

function drawTransition(transition, alpha=0.25) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.arc(transition.x, transition.y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function refreshView() {
    if(selected_transition == null) {
        for(let element of popupElements) {
            element.classList.add("hide");
        }
    }
    let scene = scenes[current_scene_key];
    let background = new Image();
    background.src = "images/" + scene.background;
    background.onload = function() {
        ctx.drawImage(background, 0, -((background.height * 800 / background.width)-600)/2, 800, background.height * 800 / background.width);
        for(let transition of scene.transitions) {
            if(transition == selected_transition) {
                drawTransition(transition, 0.75);
                let x_offset = transition.x <= 700 ? r + 10 : -r - 180;
                let y_offset = transition.x <= 550 ? -r - 5 : -r - 5;

                document.querySelector(".popup.title").textContent = transition.path;

                for(let element of popupElements) {
                    element.style.left = `${x_offset + transition.x}px`;
                    element.style.top = `${y_offset + transition.y}px`;
                }

                popupElements[0].classList.remove("hide");
                popupElements[1].classList.remove("hide");
            }
            else {
                drawTransition(transition);
            }
        }
        document.getElementById("description").textContent = current_scene_key;
    }
}

async function loadScenes() {
    if(lock) {
        return;
    }

    lock = true;

    try {
        const response = await fetch(serverRoot);
        const data = await response.json();
        scenes = data;
        selected_transition = null;
        if(current_scene_key == null) {
            current_scene_key = Object.keys(scenes)[0];
        }
        refreshView();
    } catch (e) {
        console.error(e);
    }
    finally {
        lock = false;
    }
}

function goToScene(key) {
    if(lock) {
        return;
    }

    lock = true;

    current_scene_key = key;
    selected_transition = null;
    refreshView();

    lock = false;
}

async function saveScenes() {
    if(lock) {
        return;
    }

    lock = true;

    try {
        const response = await fetch(serverRoot, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scenes)
        });
        const data = await response.json();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
    finally {
        lock = false;
    }
}

loadScenes();
