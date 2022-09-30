const serverRoot = "http://localhost:5001/";

const r = 25;

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var scenes = null;
var selected_transition = null;
var current_scene_key = null;
var lock = false;
var popupSide = "right";
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
        refreshView(dragging=true);
    }
}

document.addEventListener('mousemove', drag);

var description = document.getElementById("description");
description.addEventListener("click", function() {
    description.contentEditable = true;
    description.focus();
});

description.addEventListener("keydown", function(e) {
    if(e.key != "Enter") {
        return;
    }

    description.contentEditable = false;
    // replace the keys
    let new_key = description.textContent;
    scenes[new_key] = scenes[current_scene_key];
    delete scenes[current_scene_key];

    // replace path if it matches new_key
    for(let key of Object.keys(scenes)) {
        for(let transition of scenes[key].transitions) {
            if(transition.path == current_scene_key) {
                transition.path = new_key;
            }
        }
    }

    current_scene_key = new_key;

    refreshView();
});

var moveTransitionButton = document.querySelector(".popup.buttons .move");
moveTransitionButton.addEventListener('mousedown', function(e) {
    dragTransition = selected_transition;
    dragOffset.x = e.clientX - selected_transition.x;
    dragOffset.y = e.clientY - selected_transition.y;
})

var dropdownButton = document.querySelector(".popup.buttons .dropdown");
var dropdownList = document.querySelector(".popup.list");
dropdownButton.addEventListener('click', function(e) {
    dropdownList.classList.toggle("hide");
})

var deleteTransitionButton = document.querySelector(".popup.buttons .delete");
deleteTransitionButton.addEventListener('click', function(e) {
    if(selected_transition != null) {
        const index = scenes[current_scene_key].transitions.indexOf(selected_transition);
        scenes[current_scene_key].transitions.splice(index, 1);
        selected_transition = null;
        refreshView();
    }
})

var newSceneButton = document.querySelector("#controls .new");
newSceneButton.addEventListener('click', newScene);

var deleteSceneButton = document.querySelector("#controls .delete");
deleteSceneButton.addEventListener('click', deleteScene);

var setAsFirstSceneButton = document.querySelector("#controls .setAsFirstScene");
setAsFirstSceneButton.addEventListener('click', setAsFirstScene);

var saveToServerButton = document.querySelector("#controls .save.server");
saveToServerButton.addEventListener('click', saveToServer);

var loadFromServerButton = document.querySelector("#controls .load.server");
loadFromServerButton.addEventListener('click', loadFromServer);

var saveToFileButton = document.querySelector("#controls .save.file");
saveToFileButton.addEventListener('click', saveToFile);

var loadFromFileButton = document.querySelector("#controls .load.file");
loadFromFileButton.addEventListener('click', loadFromFile);

document.addEventListener('mouseup', function(e) {
    if(dragTransition) {
        dragTransition = null;
        refreshView();
    }
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

function refreshView(dragging=false) {
    if(dragging == false) {
        popupSide = selected_transition?.x > 500 ? "left" : "right";
    }

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
                let x_offset = popupSide == "right" ? r + 10 : -r - 180;
                let y_offset = -r - 5;

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
        document.querySelector(".popup.list").innerHTML = "";
        for(let key of Object.keys(scenes)) {
            let option = document.createElement("div");
            option.classList.add("option");
            option.onclick = function() {
                selected_transition.path = key;
                refreshView();
            }
            option.value = key;
            option.textContent = key;
            document.querySelector(".popup.list").appendChild(option);
        }
    }
}

async function loadFromServer() {
    if(lock) {
        return;
    }

    lock = true;

    try {
        const response = await fetch(serverRoot);
        const data = await response.json();
        scenes = data;
        selected_transition = null;
        current_scene_key = Object.keys(scenes)[0];
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

async function saveToServer() {
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

function loadFromFile() {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        var file = e.target.files[0]; 
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            scenes = JSON.parse(content);
            selected_transition = null;
            current_scene_key = Object.keys(scenes)[0];
            refreshView();
        }
    }

    input.click();
}

function saveToFile() {
    if(lock) {
        return;
    }

    lock = true;

    // download scenes as json file
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenes));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "scenes.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    lock = false;
}

function newScene() {
    if(lock) {
        return;
    }

    lock = true;

    let key = prompt("Enter scene key");
    if(key == null) {
        lock = false;
        return;
    }
    if(scenes[key] != null) {
        alert("Scene with this key already exists");
        lock = false;
        return;
    }
    scenes[key] = {
        background: "tha_ba.png",
        transitions: []
    };
    current_scene_key = key;
    selected_transition = null;
    refreshView();
    
    lock = false;
}

function deleteScene() {
    if(lock) {
        return;
    }

    lock = true;

    if(current_scene_key == null) {
        alert("No scene selected");
        lock = false;
        return;
    }
    if(Object.keys(scenes).length == 1) {
        alert("Can't delete last scene");
        lock = false;
        return;
    }
    if(!confirm("Are you sure you want to delete this scene?")) {
        lock = false;
        return;
    }
    delete scenes[current_scene_key];
    current_scene_key = Object.keys(scenes)[0];
    selected_transition = null;
    refreshView();
    
    lock = false;
}

function setAsFirstScene() {
    if(lock) {
        return;
    }

    lock = true;

    // set current scene as first key in scenes
    let new_scenes = {};
    new_scenes[current_scene_key] = scenes[current_scene_key];
    for(let key of Object.keys(scenes)) {
        if(key != current_scene_key) {
            new_scenes[key] = scenes[key];
        }
    }
    scenes = new_scenes;
    refreshView();
    
    lock = false;
}

loadFromServer();
