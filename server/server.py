from textwrap import indent
from flask import Flask, json, request
from flask_cors import CORS

api = Flask(__name__)
cors = CORS(api, resources={r"*": {"origins": "*"}})


@api.route("/<path>", methods=["GET", "POST"])
def get_scene(path):
    print("got")
    if request.method == "GET":
        """Give the scene data to the user"""
        scenes = None
        with open("scenes.json", "r") as f:
            scenes = json.load(f)

        if path not in scenes.keys():
            return json.dumps({"error": f"404 - Scene not found ({path})"}), 404

        scene = scenes[path]
        return json.dumps(scene)

    elif request.method == "POST":
        """Modify the scene data"""
        scene_str = request.data
        print(scene_str)

        if(scene_str == None):
            return json.dumps({"error": "400 - Bad request. Missing scene parameter"}), 400

        scenes = None
        with open("scenes.json", "r+") as f:
            scenes = json.load(f)
            scenes[path] = json.loads(scene_str)
            print(scenes)
            f.seek(0)
            json.dump(scenes, f, indent=4)
            f.truncate()

        return json.dumps({"success": "202 - Accepted scene update"}), 202

    else:
        return json.dumps({"error": f"405 - Method not allowed ({request.method})"}), 405


if __name__ == "__main__":
    api.run()
