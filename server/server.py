from flask import Flask, json, request
from flask_cors import CORS

api = Flask(__name__)
cors = CORS(api, resources={r"*": {"origins": "*"}})


@api.route("/scenes/", methods=["GET", "POST"])
def api_scenes():
    if request.method == "GET":
        """Give the scene data to the user"""
        scenes = None
        with open("scenes.json", "r") as f:
            scenes = json.load(f)

        return json.dumps(scenes)

    if request.method == "POST":
        """Update the scenes"""
        scenes_str = request.data.decode("utf-8")

        if scenes_str == "":
            return json.dumps({"error": "400 - Missing data"}), 400

        scenes = None
        try:
            scenes = json.loads(scenes_str)
        except:
            return json.dumps({"error": "400 - Could not parse json data"}), 400

        # TODO: Validate the json after loading it

        with open("scenes.json", "w") as f:
            scenes = json.dump(scenes, f, indent=4, sort_keys=False)

        return json.dumps({"success": "202 - Scenes updated"}), 201

    else:
        return json.dumps({"error": "405 - Method not allowed"}), 405


# @api.route("/backgrounds/<name>", methods=["GET", "POST"])
# def api_backgrounds(name):
#     if request.method == "GET":
#         if(name is None):
#             # return all backgrounds
#             with

if __name__ == "__main__":
    api.run(host="localhost", port=5001, debug=False)
