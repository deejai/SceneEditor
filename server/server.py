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
        return json.dumps({"success": "202 - Accepted scene update"}), 202

    else:
        return json.dumps({"error": f"405 - Method not allowed ({request.method})"}), 405


if __name__ == "__main__":
    api.run()
